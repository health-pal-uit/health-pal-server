import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createFromSupabase(
    payload: { supabaseId: string; email: string; isVerified: boolean },
    createUserDto: CreateUserDto,
  ) {
    const user = this.userRepository.create({
      id: payload.supabaseId,
      email: payload.email,
      isVerified: payload.isVerified,
      role: { id: createUserDto.role_id }, // set the role relation
      created_at: new Date(),
      username: createUserDto.username,
      fullname: createUserDto.fullname,
      phone: createUserDto.phone,
      gender: createUserDto.gender,
      birth_date: new Date(createUserDto.birth_date), // nếu entity là Date
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

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.userRepository.update(id, updateUserDto);
  }

  async remove(id: string) {
    return await this.userRepository.delete(id);
  }
}
