import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from 'src/supabase/supabase-admin.provider';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { User as UserEntity } from 'src/users/entities/user.entity';
import * as crypto from 'crypto';
import { ReqUserType } from './types/req.type';
@Injectable()
export class AuthService {
  constructor(
    @Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient,
    private readonly usersService: UsersService,
  ) {}

  // async inviteUser (email: string, redirectTo: string): Promise<User> {
  //   const { data, error } = await this.supabase.auth.admin.inviteUserByEmail(email, {redirectTo});
  //   if (error) {
  //     throw error;
  //   }
  //   return data.user!;
  // }

  async signUp(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findOneByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User already exists in the database');
    }

    // Check if user exists in Supabase Auth
    const { data: usersList } = await this.supabase.auth.admin.listUsers();
    const supabaseUser = usersList.users.find((u: User) => u.email === createUserDto.email);
    if (supabaseUser) {
      throw new ConflictException('User already exists');
    }

    const { data, error } = await this.supabase.auth.signUp({
      email: createUserDto.email,
      password: createUserDto.password,
      options: {
        emailRedirectTo: 'http://localhost:3001/auth/callback',
      },
    });
    if (error) {
      throw new BadRequestException(error.message);
    }

    try {
      await this.usersService.createFromSupabase(
        {
          supabaseId: data.user!.id,
          email: data.user!.email!,
          isVerified: false,
        },
        createUserDto,
      );
    } catch (dbError) {
      // Rollback: Delete the user from Supabase Auth if DB creation fails
      try {
        await this.supabase.auth.admin.deleteUser(data.user!.id);
      } catch (rollbackError) {
        console.error('Error rolling back user creation:', rollbackError);
      }
      throw new BadRequestException('Failed to create user in database');
    }

    return { user: data.user };
  }

  async checkVerification(email: string) {
    const { data: usersList } = await this.supabase.auth.admin.listUsers();
    const supabaseUser = usersList.users.find((u: User) => u.email === email);
    if (!supabaseUser) {
      throw new NotFoundException('User not found');
    }
    if (supabaseUser.confirmed_at) {
      await this.usersService.markVerified(supabaseUser.id);
    }
    return { isVerified: !!supabaseUser.confirmed_at };
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const { email, password } = loginDto;
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { token: data.session.access_token };
  }

  async logOut(): Promise<{ message: string }> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw new BadRequestException(error.message);
    }
    return { message: 'Logged out successfully' };
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase.auth.admin.getUserById(id);
    if (error) {
      throw new NotFoundException('User not found');
    }
    return data.user;
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const { error } = await this.supabase.auth.admin.deleteUser(id);
    if (error) {
      throw new BadRequestException(error.message);
    }
    return { message: 'User deleted successfully' };
  }

  async validateGoogleUser(googleUser: CreateUserDto): Promise<UserEntity> {
    googleUser.password = generateSecurePassword(googleUser.email + '@HealthPal');
    googleUser.username = sanitizeName(googleUser.username || googleUser.email.split('@')[0]);

    const { email } = googleUser;
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      return existingUser;
    }

    // Check if user exists in Supabase Auth
    const { data: usersList } = await this.supabase.auth.admin.listUsers();
    const supabaseUser = usersList.users.find((u: User) => u.email === googleUser.email);
    if (supabaseUser) {
      throw new ConflictException('User already exists');
    }

    // Create new user on both Supabase Auth and DB
    const { data, error } = await this.supabase.auth.admin.createUser({
      email: googleUser.email,
      password: googleUser.password,
      email_confirm: true,
      user_metadata: {
        username: googleUser.username,
      },
    });
    if (error) {
      throw new BadRequestException(error.message);
    }

    return this.usersService.createFromSupabase(
      {
        supabaseId: data.user.id,
        email: data.user.email!,
        isVerified: false,
      },
      googleUser,
    );
  }

  async signToken(payload: ReqUserType): Promise<string> {
    const user = await this.usersService.findOneByEmail(payload.email);
    if (!user) {
      throw new NotFoundException('User not found in database');
    }

    const password = generateSecurePassword(payload.email + '@HealthPal');

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: payload.email,
      password: password,
    });

    if (error) {
      return '';
    }

    return data.session.access_token;
  }
}

function sanitizeName(name: string): string {
  return (
    name
      .normalize('NFD') // Break characters into base + diacritics
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      // eslint-disable-next-line no-control-regex
      .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
      .replace(/\s+/g, '') // Remove all spaces
      .toLowerCase()
  ); // Lowercase everything
}

function generateSecurePassword(googleEmail: string): string {
  return crypto
    .createHash('sha256')
    .update(googleEmail + '@HealthPal_SecureKey_2025') // consistent salt for same email
    .digest('hex')
    .slice(0, 16);
}
