import { PartialType } from '@nestjs/swagger';
import { CreateVideoCallDto } from './create-video_call.dto';

export class UpdateVideoCallDto extends PartialType(CreateVideoCallDto) {}
