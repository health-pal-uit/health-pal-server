import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import axios from 'axios';
import { ActivityRecord } from 'src/activity_records/entities/activity_record.entity';
import { Activity } from 'src/activities/entities/activity.entity';
import { RecordType } from 'src/helpers/enums/record-type.enum';
import { DailyLogsService } from 'src/daily_logs/daily_logs.service';

@Injectable()
export class GoogleFitService {
  private readonly googleOAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  private readonly googleTokenUrl = 'https://oauth2.googleapis.com/token';
  private readonly googleFitApiUrl = 'https://www.googleapis.com/fitness/v1';

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(ActivityRecord)
    private readonly activityRecordRepo: Repository<ActivityRecord>,
    @InjectRepository(Activity) private readonly activityRepo: Repository<Activity>,
    private readonly dailyLogsService: DailyLogsService,
  ) {}

  getAuthorizationUrl(userId: string): string {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const redirectUri = this.configService.get<string>('GOOGLE_FIT_CALLBACK_URL');

    if (!clientId || !redirectUri) {
      throw new Error('Missing Google OAuth configuration. Check your .env file.');
    }

    const scopes = [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.body.read',
      'https://www.googleapis.com/auth/fitness.nutrition.read',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: userId,
    });

    const authUrl = `${this.googleOAuthUrl}?${params.toString()}`;
    console.log('Generated Auth URL:', authUrl);

    return authUrl;
  }

  async connectGoogleFit(userId: string, authCode: string): Promise<boolean> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GOOGLE_FIT_CALLBACK_URL');

    const tokenResponse = await axios.post(
      this.googleTokenUrl,
      new URLSearchParams({
        code: authCode,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri!,
        grant_type: 'authorization_code',
      }),
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    const userInfo = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    // save tokens
    await this.userRepo.update(userId, {
      google_fit_access_token: access_token,
      google_fit_refresh_token: refresh_token,
      google_fit_connected_at: new Date(),
      google_fit_email: userInfo.data.email,
      google_fit_token_expires_at: new Date(Date.now() + expires_in * 1000),
    });
    return true;
  }

  async getConnectionStatus(userId: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    return !!(user && user.google_fit_access_token);
  }

  async disconnectGoogleFit(userId: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (user) {
      user.google_fit_access_token = null;
      user.google_fit_refresh_token = null;
      user.google_fit_connected_at = null;
      user.google_fit_email = null;
      user.google_fit_token_expires_at = null;
      await this.userRepo.save(user);
      return true;
    }
    return false;
  }

  async getValidAccessToken(user: User): Promise<string> {
    if (user.google_fit_token_expires_at && user.google_fit_token_expires_at > new Date()) {
      return user.google_fit_access_token!;
    }
    // refresh token
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const tokenResponse = await axios.post(
      this.googleTokenUrl,
      new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        refresh_token: user.google_fit_refresh_token!,
        grant_type: 'refresh_token',
      }),
    );
    const { access_token, expires_in } = tokenResponse.data;

    // update user with new access token
    user.google_fit_access_token = access_token;
    user.google_fit_token_expires_at = new Date(Date.now() + expires_in * 1000);
    await this.userRepo.save(user);
    return access_token;
  }

  async syncGoogleFitData(
    userId: string,
    startDate: Date,
    endDate: Date,
    bucketDuration: number,
  ): Promise<ActivityRecord[]> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.google_fit_access_token) {
      throw new Error('User not connected to Google Fit');
    }
    const accessToken = await this.getValidAccessToken(user);
    const startMs = startDate.getTime();
    const endMs = endDate.getTime();

    // Query Google Fit API
    const response = await axios.post(
      `${this.googleFitApiUrl}/users/me/dataset:aggregate`,
      {
        aggregateBy: [
          { dataTypeName: 'com.google.step_count.delta' },
          { dataTypeName: 'com.google.calories.expended' },
          { dataTypeName: 'com.google.active_minutes' },
          { dataTypeName: 'com.google.heart_minutes' },
        ],
        bucketByTime: { durationMillis: bucketDuration }, // Daily
        startTimeMillis: startMs,
        endTimeMillis: endMs,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const buckets = response.data.bucket;

    // Process and store the data
    const savedRecords: ActivityRecord[] = [];

    for (const bucket of buckets) {
      try {
        const record = await this.mapGoogleFitBucketToActivityRecord(bucket, userId);
        if (record) {
          savedRecords.push(record);
        }
      } catch (error) {
        Logger.error(`Error processing bucket: ${error.message}`, error.stack);
      }
    }

    Logger.log(
      `Synchronized ${savedRecords.length} activity records from ${buckets.length} buckets for user ${userId}`,
    );

    return savedRecords;
  }

  private async mapGoogleFitBucketToActivityRecord(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bucket: any,
    userId: string,
  ): Promise<ActivityRecord | null> {
    // Extract data from bucket
    let kcal_burned = 0;
    let distance_km = 0;
    let active_minutes = 0;
    let ahr = 0;

    for (const dataset of bucket.dataset) {
      for (const point of dataset.point) {
        const dataType = point.dataTypeName;

        switch (dataType) {
          case 'com.google.calories.expended':
            kcal_burned += point.value[0].fpVal || 0;
            break;

          case 'com.google.distance.delta':
            distance_km += (point.value[0].fpVal || 0) / 1000; // meters to km
            break;

          case 'com.google.active_minutes':
            active_minutes += point.value[0].intVal || 0;
            break;

          case 'com.google.heart_minutes':
            // This is weighted heart minutes, could use for intensity
            break;

          case 'com.google.heart_rate.bpm': {
            // Average heart rate
            const hr = point.value[0].fpVal;
            if (hr && hr > 0) {
              ahr = Math.round(hr);
            }
            break;
          }
        }
      }
    }

    // If no meaningful data, skip this bucket
    if (kcal_burned === 0 && distance_km === 0 && active_minutes === 0) {
      return null;
    }

    const hours = active_minutes / 60;

    // determine activity type - for simplicity, assume walking for now
    const activityId = await this.mapGoogleFitActivityToActivity('walking');
    if (!activityId) {
      Logger.warn('Could not find walking activity in database');
      return null;
    }

    const activity = await this.activityRepo.findOne({ where: { id: activityId } });
    if (!activity) {
      return null;
    }

    // Get or create daily log for the bucket's date
    const bucketDate = new Date(parseInt(bucket.startTimeMillis));
    const dailyLog = await this.dailyLogsService.getOrCreateDailyLog(userId, bucketDate);
    if (!dailyLog) {
      Logger.error('Could not create/find daily log for Google Fit data');
      return null;
    }

    // Create activity record
    const activityRecord = this.activityRecordRepo.create();
    activityRecord.user_owned = false; // From Google Fit, not user-entered
    activityRecord.type = RecordType.DAILY;
    activityRecord.activity = activity;
    activityRecord.daily_log = dailyLog;
    activityRecord.hours = hours;
    activityRecord.kcal_burned = kcal_burned;
    activityRecord.distance_km = distance_km;
    if (ahr > 0) {
      activityRecord.ahr = ahr;
    }
    // reps, load_kg, user_weight_kg, rhr, intensity_level remain undefined (Google Fit doesn't track these)

    dailyLog.total_kcal_burned += kcal_burned;
    await this.dailyLogsService.save(dailyLog);

    const savedRecord = await this.activityRecordRepo.save(activityRecord);

    // Recalculate total_kcal (total_kcal = total_kcal_eaten - total_kcal_burned)
    await this.dailyLogsService.recalculateTotalKcal(dailyLog.id);

    Logger.log(
      `Saved Google Fit activity: ${hours.toFixed(2)}h, ${kcal_burned.toFixed(0)} kcal, ${distance_km.toFixed(2)} km`,
    );

    return savedRecord;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async mapGoogleFitBucketToPartialRecord(bucket: any): Promise<Partial<ActivityRecord>> {
    const record: Partial<ActivityRecord> = {
      user_owned: false,
      type: RecordType.DAILY,
    };

    for (const dataset of bucket.dataset) {
      for (const point of dataset.point) {
        const dataType = point.dataTypeName;

        switch (dataType) {
          case 'com.google.calories.expended':
            record.kcal_burned = point.value[0].fpVal;
            break;

          case 'com.google.distance.delta':
            record.distance_km = point.value[0].fpVal / 1000; // meters to km
            break;

          case 'com.google.active_minutes':
            record.hours = point.value[0].intVal / 60; // minutes to hours
            break;

          case 'com.google.heart_rate.bpm':
            record.ahr = Math.round(point.value[0].fpVal);
            break;
        }
      }
    }

    return record;
  }

  async mapGoogleFitActivityToActivity(
    activityType: string,
    speedMph?: number,
  ): Promise<string | null> {
    // Mapping for walking activities based on speed
    if (activityType === 'walking' || activityType === 'walk') {
      let activityName: string;

      if (!speedMph) {
        // Default to moderate pace if speed is unknown
        activityName = 'Walking, 2.8to3.4mph, level, moderate pace, firmsurface';
      } else if (speedMph < 2.0) {
        activityName = 'Walking, lessthan2.0mph, level, strolling, veryslow';
      } else if (speedMph < 2.5) {
        activityName = 'Walking, 2.0to2.4mph, level, slowpace, firmsurface';
      } else if (speedMph < 2.8) {
        activityName = 'Walking, 2.5mph, firm, levelsurface';
      } else if (speedMph < 3.5) {
        activityName = 'Walking, 2.8to3.4mph, level, moderate pace, firmsurface';
      } else if (speedMph < 4.0) {
        activityName = 'Walking, 3.5to3.9mph, level, brisk, firmsurface, walkingforexercise';
      } else if (speedMph < 4.5) {
        activityName = 'Walking, 4.0to4.4mph(6.4to7.0km/h), level, firmsurface, verybriskpace';
      } else if (speedMph < 5.0) {
        activityName = 'Walking, 4.5to4.9mph, level, firmsurface, very, verybrisk';
      } else {
        activityName = 'Walking, 5.0to5.5mph(8.8to8.9km/h), level, firmsurface';
      }

      const activity = await this.activityRepo.findOne({ where: { name: activityName } });
      return activity?.id || null;
    }

    // Mapping for running activities
    if (activityType === 'running' || activityType === 'run') {
      let activityName: string;

      if (!speedMph) {
        // Default to self-selected pace if speed is unknown
        activityName = 'Running, self-selected pace';
      } else if (speedMph < 5.0) {
        activityName = 'Running, 4to4.2mph(13min/mile)';
      } else if (speedMph < 5.5) {
        activityName = 'Running, 5.0to5.2mph(12min/mile)';
      } else if (speedMph < 6.0) {
        activityName = 'Running, 5.5-5.8mph';
      } else if (speedMph < 6.5) {
        activityName = 'Running, 6-6.3mph(10min/mile)';
      } else if (speedMph < 7.0) {
        activityName = 'Running, 6.7mph(9min/mile)';
      } else if (speedMph < 7.5) {
        activityName = 'Running, 7mph(8.5min/mile)';
      } else if (speedMph < 8.0) {
        activityName = 'Running, 7.5mph(8min/mile)';
      } else if (speedMph < 8.5) {
        activityName = 'Running, 8mph(7.5min/mile)';
      } else if (speedMph < 9.0) {
        activityName = 'Running, 8.6mph(7min/mile)';
      } else if (speedMph < 9.5) {
        activityName = 'Running, 9mph(6.5min/mile)';
      } else if (speedMph < 10.0) {
        activityName = 'Running, 9.3to9.6mph';
      } else if (speedMph < 11.0) {
        activityName = 'Running, 10mph(6min/mile)';
      } else if (speedMph < 12.0) {
        activityName = 'Running, 11mph(5.5min/mile)';
      } else if (speedMph < 13.0) {
        activityName = 'Running, 12mph(5.0min/mile)';
      } else if (speedMph < 14.0) {
        activityName = 'Running, 13mph(4.6min/mile)';
      } else {
        activityName = 'Running, 14mph(4.3min/mile)';
      }

      const activity = await this.activityRepo.findOne({ where: { name: activityName } });
      return activity?.id || null;
    }

    // Mapping for cycling activities
    if (activityType === 'cycling' || activityType === 'biking') {
      // Default to moderate cycling
      const activity = await this.activityRepo.findOne({
        where: { name: 'Bicycling, general' },
      });
      return activity?.id || null;
    }

    // Add more mappings as needed for other activity types
    // swimming, yoga, strength training, etc.

    Logger.warn(`No mapping found for Google Fit activity type: ${activityType}`);
    return null;
  }
}
