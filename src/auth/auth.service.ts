import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from 'src/supabase/supabase-admin.provider';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
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
      throw new Error('User already exists in the database');
    }
    const { data: users, error: listError } = await this.supabase.auth.admin.listUsers();
    if (listError) {
      throw listError;
    }
    if (users.users.find((user) => user.email === createUserDto.email)) {
      throw new Error('User already exists');
    }
    const { data, error } = await this.supabase.auth.signUp({
      email: createUserDto.email,
      password: createUserDto.password,
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback',
      },
    });
    if (error) {
      throw error;
    }

    await this.usersService.createFromSupabase(
      {
        supabaseId: data.user!.id,
        email: data.user!.email!,
        isVerified: false,
      },
      createUserDto,
    );

    return { user: data.user };
  }

  async checkVerification(email: string) {
    const { data: users, error: listError } = await this.supabase.auth.admin.listUsers();
    if (listError) {
      throw listError;
    }
    const user = users.users.find((user) => user.email === email);
    if (!user) {
      throw new Error('User not found');
    }
    if (user.confirmed_at) {
      await this.usersService.markVerified(user.id);
    }
    return { isVerified: !!user.confirmed_at };
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const { email, password } = loginDto;
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw error;
    }
    return { token: data.session.access_token };
  }

  async logOut(): Promise<{ message: string }> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw error;
    }
    return { message: 'Logged out successfully' };
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase.auth.admin.getUserById(id);
    if (error) {
      throw error;
    }
    return data.user;
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const { error } = await this.supabase.auth.admin.deleteUser(id);
    if (error) {
      throw error;
    }
    return { message: 'User deleted successfully' };
  }
}
