import { Injectable } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from './entities/device.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { UpdateResult } from 'typeorm';
import { DeleteResult } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device) private devicesRepository: Repository<Device>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async registerDevice(createDeviceDto: CreateDeviceDto): Promise<Device> {
    // user_id must be present in DTO
    const device = this.devicesRepository.create(createDeviceDto);
    return this.devicesRepository.save(device);
  }

  async deactivateDevice(user: any, updateDeviceDto: UpdateDeviceDto): Promise<UpdateResult> {
    // Only allow deactivation of user's own device
    return this.devicesRepository.update(
      { id: updateDeviceDto.device_id, user: { id: user.id } },
      { last_active_at: undefined },
    );
  }

  async getAllDevices(
    page = 1,
    limit = 10,
  ): Promise<{ data: Device[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.devicesRepository.findAndCount({
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async getDevicesByUser(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Device[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.devicesRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async getDeviceById(id: string, userId: string): Promise<Device | null> {
    return this.devicesRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });
  }

  async deleteDevice(id: string, userId: string): Promise<DeleteResult> {
    return this.devicesRepository.delete({ id, user: { id: userId } });
  }

  async refreshToken(user: any, dto: { fcm_token: string }): Promise<{ token: string }> {
    const device = await this.devicesRepository.findOne({
      where: { user: { id: user.id }, last_active_at: Not(IsNull()) },
    });
    if (!device) {
      throw new Error('No active device found for the user');
    }
    device.push_token = dto.fcm_token;
    await this.devicesRepository.save(device);
    return { token: dto.fcm_token };
  }
}
