import { Injectable } from '@nestjs/common';
import { CreateVideoCallDto } from './dto/create-video_call.dto';
import { UpdateVideoCallDto } from './dto/update-video_call.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { VideoCall, VideoCallStatus } from './entities/video_call.entity';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { Consultation } from 'src/consultations/entities/consultation.entity';
import { User } from 'src/users/entities/user.entity';
import { Expert } from 'src/experts/entities/expert.entity';

@Injectable()
export class VideoCallsService {
  constructor(
    @InjectRepository(VideoCall) private videoCallRepository: Repository<VideoCall>,
    @InjectRepository(Consultation) private consultationRepository: Repository<Consultation>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Expert) private expertRepository: Repository<Expert>,
  ) {}

  async create(createVideoCallDto: CreateVideoCallDto): Promise<VideoCall> {
    const videoCall = this.videoCallRepository.create({
      status: createVideoCallDto.status || VideoCallStatus.WAITING,
      started_at: createVideoCallDto.started_at || null,
      ended_at: createVideoCallDto.ended_at || null,
      patient: { id: createVideoCallDto.patient_id } as User,
      expert: { id: createVideoCallDto.expert_id } as Expert,
      consultation: createVideoCallDto.consultation_id
        ? ({ id: createVideoCallDto.consultation_id } as Consultation)
        : null,
    });
    return this.videoCallRepository.save(videoCall);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<VideoCall[]> {
    const skip = (page - 1) * limit;
    return await this.videoCallRepository
      .createQueryBuilder('video_call')
      .leftJoinAndSelect('video_call.consultation', 'consultation')
      .leftJoinAndSelect('video_call.patient', 'patient')
      .leftJoinAndSelect('video_call.expert', 'expert')
      .skip(skip)
      .take(limit)
      .orderBy('video_call.created_at', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<VideoCall | null> {
    return await this.videoCallRepository.findOne({
      where: { id },
      relations: ['consultation', 'patient', 'expert'],
    });
  }

  async findByConsultation(consultation_id: string): Promise<VideoCall | null> {
    return await this.videoCallRepository.findOne({
      where: { consultation: { id: consultation_id } },
      relations: ['consultation', 'patient', 'expert'],
    });
  }

  async update(id: string, updateVideoCallDto: UpdateVideoCallDto): Promise<UpdateResult> {
    return this.videoCallRepository.update(id, updateVideoCallDto);
  }

  async updateStatus(id: string, status: VideoCallStatus): Promise<UpdateResult> {
    const updateData: any = { status };

    // auto-set timestamps based on status
    if (status === VideoCallStatus.ACTIVE && !updateData.started_at) {
      updateData.started_at = new Date();
    }

    if (status === VideoCallStatus.ENDED || status === VideoCallStatus.FAILED) {
      updateData.ended_at = new Date();

      // calculate duration if we have started_at
      const call = await this.findOne(id);
      if (call?.started_at) {
        const duration = (updateData.ended_at.getTime() - call.started_at.getTime()) / 1000;
        updateData.duration_seconds = duration;
      }
    }

    return this.videoCallRepository.update(id, updateData);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.videoCallRepository.delete(id);
  }

  // helper to check if user is part of the call
  async isUserInCall(user_id: string, call_id: string): Promise<boolean> {
    const call = await this.videoCallRepository
      .createQueryBuilder('video_call')
      .leftJoinAndSelect('video_call.patient', 'patient')
      .leftJoinAndSelect('video_call.expert', 'expert')
      .leftJoinAndSelect('expert.user', 'expert_user')
      .where('video_call.id = :call_id', { call_id })
      .andWhere('(patient.id = :user_id OR expert_user.id = :user_id)', { user_id })
      .getOne();

    return !!call;
  }
}
