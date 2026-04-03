import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityRecord } from 'src/activity_records/entities/activity_record.entity';
import { Activity } from 'src/activities/entities/activity.entity';
import { DailyLogsService } from 'src/daily_logs/daily_logs.service';
import { RecordType } from 'src/helpers/enums/record-type.enum';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  FitnessSyncRecordType,
  FitnessSyncSource,
  SyncFitnessRecordDto,
  SyncFitnessRecordsBatchDto,
} from './dto/sync-fitness-record.dto';
import { FitnessSyncEvent } from './entities/fitness-sync-event.entity';

type SyncResult = {
  status: 'created' | 'skipped';
  reason?: string;
  source: FitnessSyncSource;
  record_type: FitnessSyncRecordType;
  external_record_id: string;
  activity_record_id: string | null;
};

@Injectable()
export class FitnessSyncService {
  constructor(
    @InjectRepository(FitnessSyncEvent)
    private readonly syncEventRepository: Repository<FitnessSyncEvent>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(ActivityRecord)
    private readonly activityRecordRepository: Repository<ActivityRecord>,
    private readonly dailyLogsService: DailyLogsService,
  ) {}

  async connect(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.health_connect_enabled = true;
    await this.userRepository.save(user);

    return { success: true, connected: true };
  }

  async getConnectionStatus(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      connected: user.health_connect_enabled,
      last_synced_at: user.health_connect_last_synced_at,
    };
  }

  async disconnect(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.health_connect_enabled = false;
    user.health_connect_last_synced_at = null;
    await this.userRepository.save(user);

    return { success: true };
  }

  async syncOne(userId: string, dto: SyncFitnessRecordDto): Promise<SyncResult> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.source === FitnessSyncSource.HEALTH_CONNECT && !user.health_connect_enabled) {
      throw new BadRequestException(
        'Health Connect is not connected. Call POST /fitness-sync/connect first.',
      );
    }

    const existing = await this.syncEventRepository.findOne({
      where: {
        user: { id: userId },
        source: dto.source,
        record_type: dto.record_type,
        external_record_id: dto.external_record_id,
      },
      relations: { activity_record: true },
    });

    if (existing) {
      return {
        status: 'skipped',
        reason: 'duplicate_external_record',
        source: dto.source,
        record_type: dto.record_type,
        external_record_id: dto.external_record_id,
        activity_record_id: existing.activity_record?.id || null,
      };
    }

    const eventDate = this.pickEventDate(dto);
    const dailyLog = await this.dailyLogsService.getOrCreateDailyLog(userId, eventDate);
    if (!dailyLog) {
      throw new NotFoundException('Could not create daily log');
    }

    const activity = await this.resolveActivity(dto);
    const durationMinutes = this.resolveDurationMinutes(dto);
    const kcalBurned = dto.active_calories_kcal;

    const activityRecord = this.activityRecordRepository.create({
      user_owned: false,
      type: RecordType.DAILY,
      activity,
      daily_log: dailyLog,
      duration_minutes: durationMinutes,
      kcal_burned: kcalBurned,
      ahr: dto.avg_heart_rate_bpm ? Math.round(dto.avg_heart_rate_bpm) : undefined,
      intensity_level: dto.intensity_level || 3,
    });

    const savedRecord = await this.activityRecordRepository.save(activityRecord);

    if (kcalBurned && kcalBurned > 0) {
      dailyLog.total_kcal_burned += kcalBurned;
      await this.dailyLogsService.save(dailyLog);
      await this.dailyLogsService.recalculateTotalKcal(dailyLog.id);
    }

    const syncEvent = this.syncEventRepository.create({
      user,
      source: dto.source,
      record_type: dto.record_type,
      external_record_id: dto.external_record_id,
      payload: dto as unknown as Record<string, unknown>,
      activity_record: savedRecord,
    });

    await this.syncEventRepository.save(syncEvent);

    if (dto.source === FitnessSyncSource.HEALTH_CONNECT) {
      user.health_connect_last_synced_at = new Date();
      await this.userRepository.save(user);
    }

    return {
      status: 'created',
      source: dto.source,
      record_type: dto.record_type,
      external_record_id: dto.external_record_id,
      activity_record_id: savedRecord.id,
    };
  }

  async syncBatch(userId: string, dto: SyncFitnessRecordsBatchDto) {
    const results: SyncResult[] = [];
    for (const record of dto.records) {
      const result = await this.syncOne(userId, record);
      results.push(result);
    }

    const createdCount = results.filter((r) => r.status === 'created').length;
    const skippedCount = results.length - createdCount;

    return {
      total: results.length,
      created: createdCount,
      skipped: skippedCount,
      results,
    };
  }

  async syncManually(userId: string, dto: SyncFitnessRecordsBatchDto) {
    return this.syncBatch(userId, dto);
  }

  private pickEventDate(dto: SyncFitnessRecordDto): Date {
    const candidate = dto.end_time || dto.start_time || dto.recorded_at;
    if (!candidate) {
      return new Date();
    }
    return new Date(candidate);
  }

  private resolveDurationMinutes(dto: SyncFitnessRecordDto): number {
    if (dto.duration_minutes && dto.duration_minutes > 0) {
      return dto.duration_minutes;
    }

    if (dto.start_time && dto.end_time) {
      const ms = new Date(dto.end_time).getTime() - new Date(dto.start_time).getTime();
      const minutes = ms / 60000;
      if (minutes > 0) {
        return minutes;
      }
    }

    if (dto.steps_count && dto.steps_count > 0) {
      return Math.max(1, dto.steps_count / 100);
    }

    if (dto.distance_meters && dto.distance_meters > 0) {
      const distanceKm = dto.distance_meters / 1000;
      return Math.max(1, (distanceKm / 4.8) * 60);
    }

    return 1;
  }

  private async resolveActivity(dto: SyncFitnessRecordDto): Promise<Activity> {
    const recordType = dto.record_type;
    const exerciseType = dto.exercise_type?.toLowerCase();

    let preferredName = 'Walking, 2.8to3.4mph, level, moderate pace, firmsurface';

    if (
      recordType === FitnessSyncRecordType.EXERCISE_SESSION ||
      exerciseType === 'running' ||
      exerciseType === 'run'
    ) {
      preferredName = 'Running, self-selected pace';
    }

    if (exerciseType === 'cycling' || exerciseType === 'biking') {
      preferredName = 'Bicycling, general';
    }

    const activity = await this.activityRepository.findOne({ where: { name: preferredName } });
    if (activity) {
      return activity;
    }

    const fallback = await this.activityRepository
      .createQueryBuilder('activity')
      .orderBy('activity.created_at', 'ASC')
      .getOne();

    if (!fallback) {
      throw new NotFoundException('No activities found. Seed activities first.');
    }

    return fallback;
  }
}
