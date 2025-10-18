import { Injectable } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from './entities/device.entity';
import { Repository } from 'typeorm';
import { UpdateResult } from 'typeorm';
import { DeleteResult } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device) private devicesRepository: Repository<Device>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    const device = await this.devicesRepository.create(createDeviceDto);
    const user = await this.usersRepository.findOneBy({ id: createDeviceDto.user_id });
    device.user = user!;
    return await this.devicesRepository.save(device);
  }

  async findAll(): Promise<Device[]> {
    return this.devicesRepository.find();
  }

  async findOne(id: string): Promise<Device | null> {
    return this.devicesRepository.findOneBy({ id });
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto): Promise<UpdateResult> {
    return await this.devicesRepository.update(id, updateDeviceDto);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.devicesRepository.delete(id);
  }
}
