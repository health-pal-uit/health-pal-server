import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import axios from 'axios';

@Injectable()
export class GoogleFitService {
  private readonly googleOAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  private readonly googleTokenUrl = 'https://oauth2.googleapis.com/token';
  private readonly googleFitApiUrl = 'https://www.googleapis.com/fitness/v1';

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
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
  ): Promise<any> {
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

    // TODO: Process and store the data as needed

    // const syncData = buckets.map((bucket: any) => {
    //     const date = new Date(parseInt(bucket.startTimeMillis));
    //     const data: any = { date: date.toISOString().split('T')[0] };
    //     for (const dataset of bucket.dataset) {
    //         for (const point of dataset.point) {
    //             const dataType = point.dataTypeName;
    //             if (dataType === 'com.google.step_count.delta') {
    //                 data.steps = point.value[0].intVal;
    //             } else if (dataType === 'com.google.calories.expended') {
    //                 data.calories = point.value[0].fpVal;
    //             } else if (dataType === 'com.google.active_minutes') {
    //                 data.activeMinutes = point.value[0].intVal;
    //             } else if (dataType === 'com.google.heart_minutes') {
    //                 data.heartMinutes = point.value[0].intVal;
    //             }
    //         }
    //     }
    //     return data;
    // });
    // return syncData;

    Logger.log(`Synchronized ${buckets.length} days of Google Fit data for user ${userId}`);
    Logger.log(JSON.stringify(buckets, null, 2));

    return buckets; // Return raw data for now
  }
}
