import { Injectable } from '@nestjs/common';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { Repository, UpdateResult, IsNull } from 'typeorm';

@Injectable()
export class ActivitiesService {
  constructor(@InjectRepository(Activity) private activitiesRepository: Repository<Activity>) {}

  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    const activity = this.activitiesRepository.create(createActivityDto);
    return await this.activitiesRepository.save(activity);
  }

  async findAll(): Promise<Activity[]> {
    return await this.activitiesRepository.find({ where: { deleted_at: IsNull() } });
  }

  async findOne(id: string): Promise<Activity | null> {
    return await this.activitiesRepository.findOne({ where: { id } });
  }

  async update(id: string, updateActivityDto: UpdateActivityDto): Promise<UpdateResult> {
    return await this.activitiesRepository.update(id, updateActivityDto);
  }

  async remove(id: string): Promise<UpdateResult> {
    return await this.activitiesRepository.softDelete(id);
  }
}
