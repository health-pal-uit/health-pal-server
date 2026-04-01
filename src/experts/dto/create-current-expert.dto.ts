import { OmitType } from '@nestjs/swagger';
import { CreateExpertDto } from './create-expert.dto';

export class CreateCurrentExpertDto extends OmitType(CreateExpertDto, [
  'user_id',
  'license_url',
] as const) {}
