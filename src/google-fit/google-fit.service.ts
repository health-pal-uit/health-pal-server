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
      'https://www.googleapis.com/auth/fitness.location.read',
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

    // Query Google Fit API for aggregated data
    const response = await axios.post(
      `${this.googleFitApiUrl}/users/me/dataset:aggregate`,
      {
        aggregateBy: [
          { dataTypeName: 'com.google.step_count.delta' },
          { dataTypeName: 'com.google.calories.expended' },
          { dataTypeName: 'com.google.distance.delta' },
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

    // Process and store the aggregated data
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

    // Also fetch workout sessions (includes strength training with reps/weight)
    try {
      const sessionRecords = await this.syncGoogleFitSessions(userId, startMs, endMs, accessToken);
      savedRecords.push(...sessionRecords);
    } catch (error) {
      Logger.error(`Error syncing Google Fit sessions: ${error.message}`, error.stack);
    }

    Logger.log(
      `Synchronized ${savedRecords.length} activity records from ${buckets.length} buckets for user ${userId}`,
    );

    return savedRecords;
  }

  private async syncGoogleFitSessions(
    userId: string,
    startMs: number,
    endMs: number,
    accessToken: string,
  ): Promise<ActivityRecord[]> {
    // query Google Fit Sessions API for detailed workout data
    const sessionsResponse = await axios.get(`${this.googleFitApiUrl}/users/me/sessions`, {
      params: {
        startTime: new Date(startMs).toISOString(),
        endTime: new Date(endMs).toISOString(),
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const sessions = sessionsResponse.data.session || [];
    const savedRecords: ActivityRecord[] = [];

    for (const session of sessions) {
      try {
        // only process strength training sessions
        if (this.isStrengthTrainingSession(session.activityType)) {
          const records = await this.processStrengthTrainingSession(session, userId, accessToken);
          savedRecords.push(...records);
        }
      } catch (error) {
        Logger.error(`Error processing session ${session.id}: ${error.message}`, error.stack);
      }
    }

    return savedRecords;
  }

  private isStrengthTrainingSession(activityType: number): boolean {
    // Google Fit activity type codes for strength training
    // Reference: https://developers.google.com/fit/rest/v1/reference/activity-types
    const strengthActivityTypes = [
      13, // Calisthenics (e.g., pushups, situps, pullups, jumping jacks)
      48, // Circuit training
      49, // Cross training
      59, // Elliptical
      97, // Strength training (weight lifting)
      108, // Weight training (general)
      113, // Kettlebell training
      114, // Core strength training
      115, // Functional strength training
      125, // High intensity interval training (HIIT)
      130, // Pilates
    ];
    return strengthActivityTypes.includes(activityType);
  }

  private async processStrengthTrainingSession(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session: any,
    userId: string,
    accessToken: string,
  ): Promise<ActivityRecord[]> {
    const records: ActivityRecord[] = [];

    // Fetch detailed data for this session
    // Google Fit stores resistance training data in activity segments
    const sessionStartMs = parseInt(session.startTimeMillis);
    const sessionEndMs = parseInt(session.endTimeMillis);

    try {
      // Query for resistance training data (weight and reps)
      const dataResponse = await axios.post(
        `${this.googleFitApiUrl}/users/me/dataset:aggregate`,
        {
          aggregateBy: [
            { dataTypeName: 'com.google.activity.exercise' }, // Exercise details
          ],
          bucketBySession: {
            minDurationMillis: 0,
          },
          startTimeMillis: sessionStartMs,
          endTimeMillis: sessionEndMs,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      // Process exercise data points
      const buckets = dataResponse.data.bucket || [];
      for (const bucket of buckets) {
        for (const dataset of bucket.dataset || []) {
          for (const point of dataset.point || []) {
            const record = await this.mapExercisePointToActivityRecord(point, session, userId);
            if (record) {
              records.push(record);
            }
          }
        }
      }

      // if no detailed exercise data found, create a generic strength training record
      if (records.length === 0) {
        const genericRecord = await this.createGenericStrengthRecord(session, userId);
        if (genericRecord) {
          records.push(genericRecord);
        }
      }
    } catch (error) {
      Logger.warn(`Could not fetch detailed strength training data: ${error.message}`);
      // fallback to generic record
      const genericRecord = await this.createGenericStrengthRecord(session, userId);
      if (genericRecord) {
        records.push(genericRecord);
      }
    }

    return records;
  }

  private async mapExercisePointToActivityRecord(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    point: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session: any,
    userId: string,
  ): Promise<ActivityRecord | null> {
    // Extract exercise data
    // Google Fit exercise data structure:
    // value[0] = exercise type
    // value[1] = repetitions
    // value[2] = resistance (in kg)
    // value[3] = resistance type

    const exerciseType = point.value[0]?.intVal;
    const reps = point.value[1]?.intVal || 0;
    const resistanceKg = point.value[2]?.fpVal || 0;

    if (reps === 0) {
      return null; // Skip if no reps recorded
    }

    // Map exercise type to activity in your database
    const activityId = await this.mapGoogleFitExerciseTypeToActivity(exerciseType);
    if (!activityId) {
      Logger.warn(`Could not map Google Fit exercise type ${exerciseType} to activity`);
      return null;
    }

    const activity = await this.activityRepo.findOne({ where: { id: activityId } });
    if (!activity) {
      return null;
    }

    // Get or create daily log
    const sessionDate = new Date(parseInt(session.startTimeMillis));
    const dailyLog = await this.dailyLogsService.getOrCreateDailyLog(userId, sessionDate);
    if (!dailyLog) {
      Logger.error('Could not create/find daily log for Google Fit strength training data');
      return null;
    }

    // Create activity record with reps and weight
    const activityRecord = this.activityRecordRepo.create();
    activityRecord.user_owned = false;
    activityRecord.type = RecordType.DAILY;
    activityRecord.activity = activity;
    activityRecord.daily_log = dailyLog;
    activityRecord.reps = reps;
    activityRecord.load_kg = resistanceKg > 0 ? resistanceKg : undefined;

    // Calculate calories if available
    const sessionCalories = session.calories || 0;
    if (sessionCalories > 0) {
      activityRecord.kcal_burned = sessionCalories;
      dailyLog.total_kcal_burned += sessionCalories;
      await this.dailyLogsService.save(dailyLog);
    }

    const savedRecord = await this.activityRecordRepo.save(activityRecord);

    if (sessionCalories > 0) {
      await this.dailyLogsService.recalculateTotalKcal(dailyLog.id);
    }

    Logger.log(
      `Saved Google Fit strength training: ${activity.name}, ${reps} reps${resistanceKg > 0 ? `, ${resistanceKg.toFixed(1)} kg` : ''}`,
    );

    return savedRecord;
  }

  private async createGenericStrengthRecord(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session: any,
    userId: string,
  ): Promise<ActivityRecord | null> {
    // Find a generic strength training activity
    const activity = await this.activityRepo.findOne({
      where: { name: 'Weight lifting (body building exercise), vigorous effort' },
    });

    if (!activity) {
      Logger.warn('Could not find generic strength training activity in database');
      return null;
    }

    const sessionDate = new Date(parseInt(session.startTimeMillis));
    const dailyLog = await this.dailyLogsService.getOrCreateDailyLog(userId, sessionDate);
    if (!dailyLog) {
      return null;
    }

    const durationMs = parseInt(session.endTimeMillis) - parseInt(session.startTimeMillis);
    const hours = durationMs / (1000 * 60 * 60);

    const activityRecord = this.activityRecordRepo.create();
    activityRecord.user_owned = false;
    activityRecord.type = RecordType.DAILY;
    activityRecord.activity = activity;
    activityRecord.daily_log = dailyLog;
    activityRecord.hours = hours;

    const sessionCalories = session.calories || 0;
    if (sessionCalories > 0) {
      activityRecord.kcal_burned = sessionCalories;
      dailyLog.total_kcal_burned += sessionCalories;
      await this.dailyLogsService.save(dailyLog);
    }

    const savedRecord = await this.activityRecordRepo.save(activityRecord);

    if (sessionCalories > 0) {
      await this.dailyLogsService.recalculateTotalKcal(dailyLog.id);
    }

    Logger.log(`Saved generic Google Fit strength training session: ${hours.toFixed(2)}h`);

    return savedRecord;
  }

  private async mapGoogleFitExerciseTypeToActivity(exerciseType: number): Promise<string | null> {
    // Map Google Fit exercise types to your activities
    // This is a basic mapping - expand based on your needs
    const exerciseMapping: Record<number, string> = {
      // You'll need to map these to actual activity names in your database
      1: 'Bench press',
      2: 'Squat',
      3: 'Deadlift',
      // Add more mappings as needed
    };

    const activityName = exerciseMapping[exerciseType];
    if (!activityName) {
      return null;
    }

    const activity = await this.activityRepo.findOne({ where: { name: activityName } });
    return activity?.id || null;
  }

  private async mapGoogleFitBucketToActivityRecord(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bucket: any,
    userId: string,
  ): Promise<ActivityRecord | null> {
    // extract data from bucket
    let kcal_burned = 0;
    let distance_km = 0;
    let active_minutes = 0;
    let ahr = 0;
    let step_count = 0;

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

          case 'com.google.step_count.delta':
            step_count += point.value[0].intVal || 0;
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

    // fallback
    if (distance_km === 0 && step_count > 0) {
      distance_km = (step_count * 0.762) / 1000; // convert to km
      Logger.log(`Estimated distance from ${step_count} steps: ${distance_km.toFixed(2)} km`);
    }

    if (kcal_burned === 0 && distance_km === 0 && active_minutes === 0) {
      return null;
    }

    // calculate hours from active minutes, ensure it's > 0 or null
    let hours: number | undefined = undefined;
    if (active_minutes > 0) {
      hours = active_minutes / 60;
    } else if (distance_km > 0) {
      // if we have distance but no active minutes, estimate based on average walking speed (3 mph = 4.8 km/h)
      hours = distance_km / 4.8;
    }

    // if we still don't have hours, skip this record (violates constraint)
    if (!hours || hours <= 0) {
      Logger.warn(
        `Skipping bucket: no valid hours (active_minutes: ${active_minutes}, distance: ${distance_km.toFixed(2)} km)`,
      );
      return null;
    }

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

    // get or create daily log for the bucket's date
    const bucketDate = new Date(parseInt(bucket.startTimeMillis));
    const dailyLog = await this.dailyLogsService.getOrCreateDailyLog(userId, bucketDate);
    if (!dailyLog) {
      Logger.error('Could not create/find daily log for Google Fit data');
      return null;
    }

    // estimate calories based on activity if Google Fit calories seem unrealistic
    // Google Fit often includes BMR in calories.expended, making values very high
    let estimatedCalories = kcal_burned;
    if (activity.met_value && hours) {
      // formula: calories = MET × 3.5 × weight(kg) / 200 × time(minutes)
      // assume average weight of 70kg if user weight not available
      const timeMinutes = hours * 60;
      const estimatedFromMET = ((activity.met_value * 3.5 * 70) / 200) * timeMinutes;

      // if Google Fit calories are more than 3x the MET estimate, use MET estimate instead
      if (kcal_burned > estimatedFromMET * 3) {
        Logger.warn(
          `Google Fit calories (${kcal_burned.toFixed(0)}) seem inflated. Using MET estimate (${estimatedFromMET.toFixed(0)}) instead.`,
        );
        estimatedCalories = estimatedFromMET;
      }
    }

    // Create activity record
    const activityRecord = this.activityRecordRepo.create();
    activityRecord.user_owned = false; // From Google Fit, not user-entered
    activityRecord.type = RecordType.DAILY;
    activityRecord.activity = activity;
    activityRecord.daily_log = dailyLog;
    activityRecord.hours = hours;
    activityRecord.kcal_burned = estimatedCalories;
    activityRecord.distance_km = distance_km;
    if (ahr > 0) {
      activityRecord.ahr = ahr;
    }
    // reps, load_kg, user_weight_kg, rhr, intensity_level remain undefined (Google Fit doesn't track these)

    dailyLog.total_kcal_burned += estimatedCalories;
    await this.dailyLogsService.save(dailyLog);

    const savedRecord = await this.activityRecordRepo.save(activityRecord);

    // Recalculate total_kcal (total_kcal = total_kcal_eaten - total_kcal_burned)
    await this.dailyLogsService.recalculateTotalKcal(dailyLog.id);

    Logger.log(
      `Saved Google Fit activity: ${hours.toFixed(2)}h, ${estimatedCalories.toFixed(0)} kcal${estimatedCalories !== kcal_burned ? ` (corrected from ${kcal_burned.toFixed(0)})` : ''}, ${distance_km.toFixed(2)} km`,
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
