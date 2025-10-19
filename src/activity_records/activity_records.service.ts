import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateActivityRecordDto } from './dto/create-activity_record.dto';
import { UpdateActivityRecordDto } from './dto/update-activity_record.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityRecord } from './entities/activity_record.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { DailyLogsService } from 'src/daily_logs/daily_logs.service';
import { Activity } from 'src/activities/entities/activity.entity';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { calcKcalSimple } from 'src/helpers/functions/kcal-burned-cal';
import { makeProgressAccumulator } from 'src/helpers/functions/progress-calculator';
import { ChallengesUser } from 'src/challenges_users/entities/challenges_user.entity';
import { ChallengesUsersService } from 'src/challenges_users/challenges_users.service';

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
      throw new Error('Activity not found');
    }
    createActivityRecordDto.user_owned = false;
    // const challenge = await this.challengesRepository.findOneBy({id: challengeId});
    // if (!challenge) throw new Error('Challenge not found');
    const activityRecord = this.activityRecordRepository.create();
    // activityRecord.challenge = challenge;
    activityRecord.activity = activity;
    return await this.activityRecordRepository.save({ ...createActivityRecordDto, activityRecord });
  }
  async assignToChallenge(id: string, challengeId: string): Promise<ActivityRecord> {
    const activityRecord = await this.activityRecordRepository.findOneBy({ id: id });
    if (!activityRecord) throw new Error('Not found Activity Record');
    const challenge = await this.challengesRepository.findOneBy({ id: challengeId });
    if (!challenge) throw new Error('Challenge not found');
    activityRecord.challenge = challenge;
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
      throw new Error('Activity not found');
    }
    const dailyLog = await this.dailyLogsService.getOrCreateDailyLog(
      userId,
      createActivityRecordDto.created_at ?? new Date(),
    );
    if (!dailyLog) {
      throw new Error('Daily log not found or could not be created');
    }

    createActivityRecordDto.user_owned = true;
    const activityRecord = this.activityRecordRepository.create();
    activityRecord.activity = activity;
    activityRecord.daily_log = dailyLog;

    const { kcal, method, notes } = calcKcalSimple(activityRecord, activity);
    activityRecord.kcal_burned = kcal;
    dailyLog.total_kcal_burned += kcal;
    await this.dailyLogsService.save(dailyLog);

    const savedAC = await this.activityRecordRepository.save({
      ...createActivityRecordDto,
      activityRecord,
    });
    await this.dailyLogsService.recalculateTotalKcal(dailyLog.id);
    return savedAC;
  }

  // when user click on "recalculate progress" button in challenge detail page
  async recalculateProgressChallengesForUser(challengeId: string, userId: string): Promise<number> {
    const challengeActivityRecords = await this.activityRecordRepository.find({
      where: { challenge: { id: challengeId }, user_owned: false },
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
  async findAllChallengesOfUser(challengeId: string, userId: string): Promise<ActivityRecord[]> {
    return await this.activityRecordRepository.find({
      where: {
        challenge: { id: challengeId },
        challenge_user: { user: { id: userId } },
        user_owned: true,
      },
      relations: {
        activity: true,
        challenge: true,
        challenge_user: { user: true },
      },
      order: { created_at: 'DESC' },
    });
  }

  // controller !!
  async findAllDailyLogsOfUser(userId: string, dailyLogId: string): Promise<ActivityRecord[]> {
    return await this.activityRecordRepository.find({
      where: { user_owned: true, daily_log: { user: { id: userId }, id: dailyLogId } },
      relations: { activity: true, daily_log: true },
    });
  }

  // controller !!
  async findAllChallenges(challengeId: string): Promise<ActivityRecord[]> {
    return await this.activityRecordRepository.find({
      where: { user_owned: false, challenge: { id: challengeId } },
      relations: { activity: true, challenge: true },
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
      relations: { activity: true, daily_log: true, challenge: true },
    });
    if (!activityRecord) {
      throw new Error('Activity record not found');
    }
    if (
      activityRecord.daily_log?.user.id !== userId ||
      activityRecord.challenge_user?.user.id !== userId
    ) {
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
      throw new Error('Activity record not found');
    }
    if (activityRecord.daily_log?.user.id !== userId) {
      throw new UnauthorizedException('User not authorized to update this activity record');
    }
    const dailyLog = activityRecord.daily_log;
    const activity = activityRecord.activity;
    if (!dailyLog || !activity) {
      throw new Error('Related daily log or activity not found');
    }
    dailyLog.total_kcal_burned -= activityRecord.kcal_burned || 0;
    await this.dailyLogsService.save(dailyLog);

    const { kcal, method, notes } = calcKcalSimple(activityRecord, activity);
    activityRecord.kcal_burned = kcal;

    dailyLog.total_kcal_burned += kcal;
    await this.dailyLogsService.save(dailyLog);

    const updatedAC = await this.activityRecordRepository.update(id, {
      ...updateActivityRecordDto,
      ...activityRecord,
    });
    await this.dailyLogsService.recalculateTotalKcal(dailyLog.id);
    return updatedAC;
  }

  // either delete it but cannot change related challenge or activity
  // async updateChallengesOfUser(id: string, updateActivityRecordDto: UpdateActivityRecordDto, userId: string) : Promise<UpdateResult> {
  //   const activityRecord = await this.activityRecordRepository.findOne({ where: { id }, relations: { challenge_user: { user: true }, activity: true } });
  //   if (!activityRecord) {
  //     throw new Error('Activity record not found');
  //   }
  //   if (activityRecord.challenge_user?.user.id !== userId) {
  //     throw new UnauthorizedException('User not authorized to update this activity record');
  //   }
  //   const challenge_user = activityRecord.challenge_user;
  //   challenge_user.progress_percent = await this.calculateProgressPercent(activityRecord.id, userId);
  //   await this.challengesUsersService.save(challenge_user);
  //   return await this.activityRecordRepository.update(id, updateActivityRecordDto);
  // }

  async updateChallenges(
    id: string,
    updateActivityRecordDto: UpdateActivityRecordDto,
  ): Promise<UpdateResult> {
    return await this.activityRecordRepository.update(id, updateActivityRecordDto);
  }

  async removeDailyLogsOfUser(id: string, userId: string): Promise<DeleteResult> {
    const activityRecord = await this.activityRecordRepository.findOne({
      where: { id },
      relations: { daily_log: { user: true } },
    });
    if (!activityRecord) {
      throw new Error('Activity record not found');
    }
    if (activityRecord.daily_log?.user.id !== userId) {
      throw new UnauthorizedException('User not authorized to delete this activity record');
    }

    return await this.activityRecordRepository.delete(id);
  }

  // async removeChallengesOfUser(id: string, userId: string) : Promise<DeleteResult> {
  //   const activityRecord = await this.activityRecordRepository.findOne({ where: { id }, relations: { challenge_user: { user: true } } });
  //   if (!activityRecord) {
  //     throw new Error('Activity record not found');
  //   }
  //   if (activityRecord.challenge_user?.user.id !== userId) {
  //     throw new UnauthorizedException('User not authorized to delete this activity record');
  //   }
  //   const challenge_user = activityRecord.challenge_user;
  //   challenge_user.progress_percent = await this.calculateProgressPercent(activityRecord.id, userId);
  //   await this.challengesUsersService.save(challenge_user);
  //   return await this.activityRecordRepository.delete(id);
  // }

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
      throw new Error('Activity record not found');
    }
    if (!activityRecord.challenge) {
      throw new Error('Activity record is not associated with a challenge');
    }
    const userActivityRecords = await this.activityRecordRepository.find({
      where: {
        challenge_user: { user: { id: userId } },
        user_owned: true,
        activity: { name: activityRecord.activity.name },
      },
      relations: { activity: true, challenge_user: true },
    });
    const acc = makeProgressAccumulator(activityRecord);

    for (const ar of userActivityRecords) {
      if (ar.activity.name === activityRecord.activity.name) {
        acc.add(ar);
      }
    }
    return acc.percent();
  }
}
