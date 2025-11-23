import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RolesService } from 'src/roles/roles.service';
import { Role } from 'src/roles/entities/role.entity';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly rolesService: RolesService,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly configService: ConfigService,
  ) {}

  async createFromSupabase(
    payload: { supabaseId: string; email: string; isVerified: boolean },
    createUserDto: CreateUserDto,
  ) {
    let role: Role | null;
    if (!createUserDto.role_id) {
      role = await this.rolesService.findByName('user');
      if (!role) {
        throw new Error('Default role not found');
      }
    }
    role = await this.rolesService.findOne(createUserDto.role_id!);
    if (!role) {
      throw new Error('Role not found');
    }
    const user = this.userRepository.create({
      id: payload.supabaseId,
      email: payload.email,
      isVerified: payload.isVerified,
      role: role, // set the role relation
      created_at: new Date(),
      username: createUserDto.username,
      fullname: createUserDto.fullname,
      phone: createUserDto.phone,
      gender: createUserDto.gender,
      ...(createUserDto.birth_date && { birth_date: new Date(createUserDto.birth_date) }),
      ...(createUserDto.avatar_url !== undefined && { avatar_url: createUserDto.avatar_url }),
      ...(createUserDto.premium_package_id !== undefined && {
        premium_package_id: createUserDto.premium_package_id,
      }),
    });
    return await this.userRepository.save(user);
  }

  async markVerified(supabaseId: string) {
    const user = await this.userRepository.findOneBy({ id: supabaseId });
    if (user) {
      user.isVerified = true;
      await this.userRepository.save(user);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email }, relations: ['role'] });
  }

  async findOne(id: string) {
    return await this.userRepository.findOne({ where: { id }, relations: ['role'] });
  }

  async update(id: string, updateUserDto: UpdateUserDto, imageBuffer?: Buffer, imageName?: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, updateUserDto);
    if (imageBuffer && imageName) {
      const avatarBucketName =
        this.configService.get<string>('SUPABASE_AVATAR_BUCKET_NAME') || 'avatars';
      try {
        const imageUrl = await this.supabaseStorageService.uploadImageFromBuffer(
          imageBuffer,
          imageName,
          avatarBucketName,
        );
        user.avatar_url = imageUrl || user.avatar_url;
      } catch (error) {
        console.error('Error uploading image to Supabase:', error);
      }
    }
    return await this.userRepository.save(user);
  }

  async remove(id: string) {
    return await this.userRepository.delete(id);
  }

  async getUserMedals(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['medals_users', 'medals_users.medal'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.medals_users;
  }
}
