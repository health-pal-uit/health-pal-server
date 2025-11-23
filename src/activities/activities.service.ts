import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { Repository, IsNull } from 'typeorm';

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

  async findOne(id: string): Promise<Activity> {
    const activity = await this.activitiesRepository.findOne({
      where: { id, deleted_at: IsNull() },
    });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    return activity;
  }

  async update(id: string, updateActivityDto: UpdateActivityDto): Promise<Activity> {
    const activity = await this.activitiesRepository.findOne({
      where: { id, deleted_at: IsNull() },
    });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    await this.activitiesRepository.update(id, updateActivityDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<Activity> {
    const activity = await this.activitiesRepository.findOne({
      where: { id, deleted_at: IsNull() },
    });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    await this.activitiesRepository.softDelete(id);
    return activity;
  }
}
