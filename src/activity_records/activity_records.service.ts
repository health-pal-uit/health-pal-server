import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateActivityRecordDto } from './dto/create-activity_record.dto';
import { UpdateActivityRecordDto } from './dto/update-activity_record.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityRecord } from './entities/activity_record.entity';
import { DeleteResult, IsNull, MoreThanOrEqual, Repository, UpdateResult } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { DailyLogsService } from 'src/daily_logs/daily_logs.service';
import { Activity } from 'src/activities/entities/activity.entity';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { calcKcalSimple } from 'src/helpers/functions/kcal-burned-cal';
import { makeProgressAccumulator } from 'src/helpers/functions/progress-calculator';
import { ChallengesUsersService } from 'src/challenges_users/challenges_users.service';
import { RecordType } from 'src/helpers/enums/record-type.enum';

@Injectable()
export class ActivityRecordsService {
  constructor(
    @InjectRepository(ActivityRecord) private activityRecordRepository: Repository<ActivityRecord>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Activity) private activityRepository: Repository<Activity>,
    @InjectRepository(Challenge) private challengesRepository: Repository<Challenge>,
    private challengesUsersService: ChallengesUsersService,
    private dailyLogsService: DailyLogsService,
  ) {}
  // controller !!
  async createChallenges(createActivityRecordDto: CreateActivityRecordDto) {
    const activity = await this.activityRepository.findOne({
      where: { id: createActivityRecordDto.activity_id },
    });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    if (!createActivityRecordDto.challenge_id) {
      throw new BadRequestException('Challenge ID is required for challenge activity records');
    }

    const challenge = await this.challengesRepository.findOneBy({
      id: createActivityRecordDto.challenge_id,
    });
    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    createActivityRecordDto.user_owned = false;
    createActivityRecordDto.type = RecordType.CHALLENGE;

    const activityRecord = this.activityRecordRepository.create({
      ...createActivityRecordDto,
      activity,
      challenge,
    });

    return await this.activityRecordRepository.save(activityRecord);
  }
  async assignToChallenge(id: string, challengeId: string): Promise<ActivityRecord> {
    const activityRecord = await this.activityRecordRepository.findOneBy({ id: id });
    if (!activityRecord) throw new NotFoundException('Activity record not found');
    const challenge = await this.challengesRepository.findOneBy({ id: challengeId });
    if (!challenge) throw new NotFoundException('Challenge not found');

    activityRecord.challenge = challenge;
    activityRecord.type = RecordType.CHALLENGE; // Set type when assigning to challenge
    activityRecord.daily_log = null; // Clear daily_log if it was set (mutual exclusion)

    const savedActivityRecord = await this.activityRecordRepository.save(activityRecord);
    return savedActivityRecord;
  }

  // controller !!
  async createDailyLogs(
    createActivityRecordDto: CreateActivityRecordDto,
    userId: string,
  ): Promise<ActivityRecord> {
    const activity = await this.activityRepository.findOne({
      where: { id: createActivityRecordDto.activity_id },
    });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    const dailyLog = await this.dailyLogsService.getOrCreateDailyLog(
      userId,
      createActivityRecordDto.created_at ?? new Date(),
    );
    if (!dailyLog) {
      throw new NotFoundException('Daily log not found or could not be created');
    }

    createActivityRecordDto.user_owned = true;
    createActivityRecordDto.type = RecordType.DAILY;

    const activityRecord = this.activityRecordRepository.create({
      ...createActivityRecordDto,
      activity,
      daily_log: dailyLog,
    });

    const { kcal } = calcKcalSimple(activityRecord, activity);
    activityRecord.kcal_burned = kcal;

    dailyLog.total_kcal_burned += kcal;
    await this.dailyLogsService.save(dailyLog);

    const savedAC = await this.activityRecordRepository.save(activityRecord);
    await this.dailyLogsService.recalculateTotalKcal(dailyLog.id);
    return savedAC;
  }

  // when user click on "recalculate progress" button in challenge detail page
  async recalculateProgressChallengesForUser(challengeId: string, userId: string): Promise<number> {
    const challengeActivityRecords = await this.activityRecordRepository.find({
      where: { challenge: { id: challengeId }, user_owned: false, deleted_at: IsNull() },
      relations: { activity: true, challenge: true },
    });

    const challengeUser = await this.challengesUsersService.getOrCreateChallengesUser(
      userId,
      challengeId,
    );

    const percents: number[] = [];

    for (const ar of challengeActivityRecords) {
      const percent = await this.calculateProgressPercent(ar.id, userId);
      percents.push(percent);
    }

    let overallPercent = 0;
    if (percents.length > 0) {
      overallPercent = percents.reduce((a, b) => a + b, 0) / percents.length;
    }

    challengeUser.progress_percent = Math.round(overallPercent * 10) / 10;
    await this.challengesUsersService.save(challengeUser);

    return challengeUser.progress_percent;
  }

  // controller !!
  async findAllDailyLogsOfUser(
    userId: string,
    dailyLogId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ActivityRecord[]> {
    const skip = (page - 1) * limit;
    return await this.activityRecordRepository.find({
      where: {
        user_owned: true,
        daily_log: { user: { id: userId }, id: dailyLogId },
        deleted_at: IsNull(),
      },
      relations: { activity: true, daily_log: true },
      skip,
      take: limit,
    });
  }

  // controller !!
  async findAllChallenges(
    challengeId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ActivityRecord[]> {
    const skip = (page - 1) * limit;
    return await this.activityRecordRepository.find({
      where: { user_owned: false, challenge: { id: challengeId }, deleted_at: IsNull() },
      relations: { activity: true, challenge: true },
      skip,
      take: limit,
    });
  }

  // controller !!
  async findOne(id: string, userId: string): Promise<ActivityRecord | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return null;
    }
    const activityRecord = await this.activityRecordRepository.findOne({
      where: { id },
      relations: { activity: true, daily_log: { user: true } },
    });
    if (!activityRecord) {
      throw new Error('Activity record not found');
    }
    // Only daily logs have user ownership (challenges are templates)
    if (activityRecord.daily_log && activityRecord.daily_log.user.id !== userId) {
      throw new UnauthorizedException('User not authorized to access this activity record');
    }
    return activityRecord;
  }

  // either delete it but cannot change related daily_log or activity
  async updateDailyLogsOfUser(
    id: string,
    updateActivityRecordDto: UpdateActivityRecordDto,
    userId: string,
  ): Promise<UpdateResult> {
    const activityRecord = await this.activityRecordRepository.findOne({
      where: { id },
      relations: { daily_log: { user: true }, activity: true },
    });
    if (!activityRecord) {
      throw new NotFoundException('Activity record not found');
    }
    if (activityRecord.daily_log?.user.id !== userId) {
      throw new UnauthorizedException('User not authorized to update this activity record');
    }
    const dailyLog = activityRecord.daily_log;
    const activity = activityRecord.activity;
    if (!dailyLog || !activity) {
      throw new NotFoundException('Related daily log or activity not found');
    }

    // subtract old calories from daily log
    dailyLog.total_kcal_burned -= activityRecord.kcal_burned || 0;
    await this.dailyLogsService.save(dailyLog);

    // apply updates from DTO to the entity
    Object.assign(activityRecord, updateActivityRecordDto);

    // recalculate calories with updated values
    const { kcal } = calcKcalSimple(activityRecord, activity);
    activityRecord.kcal_burned = kcal;

    // add new calories to daily log
    dailyLog.total_kcal_burned += kcal;
    await this.dailyLogsService.save(dailyLog);

    await this.activityRecordRepository.save(activityRecord);
    await this.dailyLogsService.recalculateTotalKcal(dailyLog.id);

    return { affected: 1, raw: [], generatedMaps: [] };
  }

  async updateChallenges(
    id: string,
    updateActivityRecordDto: UpdateActivityRecordDto,
  ): Promise<UpdateResult> {
    const activityRecord = await this.activityRecordRepository.findOne({
      where: { id },
      relations: { challenge: true },
    });
    if (!activityRecord) {
      throw new NotFoundException('Activity record not found');
    }
    if (!activityRecord.challenge) {
      throw new BadRequestException('Activity record is not a challenge record');
    }

    // Prevent updating fields that shouldn't be changed
    const {
      user_owned: _user_owned,
      type: _type,
      daily_log_id: _daily_log_id,
      challenge_id: _challenge_id,
      activity_id: _activity_id,
      ...allowedUpdates
    } = updateActivityRecordDto;

    if (Object.keys(allowedUpdates).length === 0) {
      throw new BadRequestException('No valid fields to update');
    }

    return await this.activityRecordRepository.update(id, allowedUpdates);
  }

  async removeDailyLogsOfUser(id: string, userId: string): Promise<DeleteResult> {
    const activityRecord = await this.activityRecordRepository.findOne({
      where: { id },
      relations: { daily_log: { user: true } },
    });
    if (!activityRecord) {
      throw new NotFoundException('Activity record not found');
    }
    if (activityRecord.daily_log?.user.id !== userId) {
      throw new UnauthorizedException('User not authorized to delete this activity record');
    }

    const dailyLog = activityRecord.daily_log;

    if (dailyLog && activityRecord.kcal_burned) {
      dailyLog.total_kcal_burned -= activityRecord.kcal_burned;
      await this.dailyLogsService.save(dailyLog);
      await this.dailyLogsService.recalculateTotalKcal(dailyLog.id);
    }

    return await this.activityRecordRepository.delete(id);
  }

  // admin guard
  async removeChallenges(id: string): Promise<DeleteResult> {
    return await this.activityRecordRepository.delete(id);
  }

  // check if 2 activity records belong to same activity

  // compare 2 activity records (one is added after a time), other belong to challenge => satisfy one of many activity records of a challenge

  // check if all activity records of a challenge satisfy the challenge condition aka (challenge_user to just challenges)
  // controller !!
  async calculateProgressPercent(activityRecordId: string, userId: string): Promise<number> {
    const activityRecord = await this.activityRecordRepository.findOne({
      where: { id: activityRecordId },
      relations: { challenge: true, activity: true },
    });
    if (!activityRecord) {
      throw new NotFoundException('Activity record not found');
    }
    if (!activityRecord.challenge) {
      throw new BadRequestException('Activity record is not associated with a challenge');
    }

    // Get when user joined this challenge (to prevent counting historical data)
    const challengeUser = await this.challengesUsersService.getOrCreateChallengesUser(
      userId,
      activityRecord.challenge.id,
    );
    const joinDate = challengeUser.achieved_at; // This is set when user first joins

    // Note: We don't have challenge-specific ActivityRecords anymore (challenge_user relation removed).
    // Progress is calculated ONLY from daily ActivityRecords created after user joined the challenge.

    const dailyActivityRecords = await this.activityRecordRepository.find({
      where: {
        daily_log: { user: { id: userId } },
        type: RecordType.DAILY,
        activity: { name: activityRecord.activity.name },
        created_at: MoreThanOrEqual(joinDate),
        deleted_at: IsNull(),
      },
      relations: { activity: true, daily_log: true },
    });

    const acc = makeProgressAccumulator(activityRecord);

    // Add all daily activities created after user joined the challenge
    for (const ar of dailyActivityRecords) {
      acc.add(ar);
    }

    return acc.percent();
  }
}
