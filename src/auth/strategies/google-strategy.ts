import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['email', 'profile'],
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    try {
      const user = await this.authService.validateGoogleUser({
        username: profile.displayName,
        email: profile.email,
        avatar_url: profile.picture,
        password: '', // Password will not be used for Google-authenticated users
      });
      if (!user) {
        return done(new Error('User validation failed'));
      }
      done(null, user);
    } catch (error) {
      console.error('Error validating Google user:', error);
      done(error);
    }
  }
}
