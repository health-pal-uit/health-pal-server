import { PartialType } from '@nestjs/mapped-types';
import { CreateMedalsUserDto } from './create-medals_user.dto';

export class UpdateMedalsUserDto extends PartialType(CreateMedalsUserDto) {}
