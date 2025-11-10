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
    const device = this.devicesRepository.create(createDeviceDto);
    return this.devicesRepository.save(device);
  }

  async deactivateDevice(user: any, updateDeviceDto: UpdateDeviceDto): Promise<UpdateResult> {
    const userEntity = await this.usersRepository.findOne({ where: { id: user.id } });
    if (!userEntity) {
      throw new Error('User not found');
    }
    return this.devicesRepository.update(
      { id: updateDeviceDto.device_id, user: { id: userEntity.id } },
      { last_active_at: undefined },
    );
  }

  async getAllDevices(user: any): Promise<Device[]> {
    return this.devicesRepository.find({ relations: ['user'] });
  }

  async refreshToken(user: any, dto: { fcm_token: string }): Promise<{ token: string }> {
    const userEntity = await this.usersRepository.findOne({ where: { id: user.id } });
    if (!userEntity) {
      throw new Error('User not found');
    }
    const device = await this.devicesRepository.findOne({
      where: { user: { id: userEntity.id }, last_active_at: Not(IsNull()) },
    });
    if (!device) {
      throw new Error('No active device found for the user');
    }
    device.push_token = dto.fcm_token;
    await this.devicesRepository.save(device);
    return { token: dto.fcm_token };
  }
}
