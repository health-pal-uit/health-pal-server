import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { SupabaseAuthStrategy } from 'nestjs-supabase-auth';
import { ExtractJwt } from 'passport-jwt';
import { ReqUserType } from '../types/req.type';
import type { User as SupabaseUser } from '@supabase/supabase-js';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(SupabaseAuthStrategy, 'supabase') {
  public constructor(private readonly configService: ConfigService) {
    super({
      supabaseUrl: configService.get<string>('SUPABASE_URL')!,
      supabaseKey: configService.get<string>('SUPABASE_KEY')!,
      supabaseOptions: {},
      extractor: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  // async validate(payload: PayloadType): Promise<ReqUserType> {
  //     if (!payload) { throw new UnauthorizedException('No payload'); }
  //     return {
  //         id: payload.sub,
  //         email: payload.email,
  //         role: 'user',
  //     };
  // }

  async validate(user: SupabaseUser): Promise<any> {
    if (!user?.id) throw new UnauthorizedException('Invalid user');
    const reqUser: ReqUserType = {
      id: user.id, // Supabase user UUID
      email: user.email ?? '',
      role: 'user',
    };
    return reqUser;
  }

  authenticate(req: Request): void {
    return super.authenticate(req);
  }
}
