import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { SupabaseAuthStrategy } from 'nestjs-supabase-auth';
import { ExtractJwt } from 'passport-jwt';
import { ReqUserType } from '../types/req.type';
import { createClient, type User as SupabaseUser } from '@supabase/supabase-js';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(SupabaseAuthStrategy, 'supabase') {
  private localSupabase;

  public constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      supabaseUrl: configService.get<string>('SUPABASE_URL')!,
      supabaseKey: configService.get<string>('SUPABASE_KEY')!,
      supabaseOptions: {},
      extractor: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });

    this.localSupabase = createClient(
      this.configService.get('SUPABASE_URL')!,
      this.configService.get('SUPABASE_KEY')!,
    );
  }

  // async validate(payload: PayloadType): Promise<ReqUserType> {
  //     if (!payload) { throw new UnauthorizedException('No payload'); }
  //     return {
  //         id: payload.sub,
  //         email: payload.email,
  //         role: 'user',
  //     };
  // }

  // async validate(user: SupabaseUser): Promise<any> {
  //   if (!user?.id) throw new UnauthorizedException('Invalid user');
  //   return { id: user.id, email: user.email ?? '', role: 'user' };
  // }

  async authenticate(req: Request) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token) return this.fail('Missing token', 401);

    const { data, error } = await this.localSupabase.auth.getUser(token);
    if (error || !data?.user) return this.fail('Invalid token', 401);
    const userInDB = await this.usersService.findOneByEmail(data.user.email!);
    if (!userInDB) return this.fail('User not found in database', 401);
    const roleName = userInDB.role?.name || 'user';

    this.success({ id: data.user.id, email: data.user.email, role: roleName }, null); // this is ReqUserType
  }
}
