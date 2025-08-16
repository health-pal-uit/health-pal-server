import { PartialType } from '@nestjs/mapped-types';
import { CreateMedalDto } from './create-medal.dto';

export class UpdateMedalDto extends PartialType(CreateMedalDto) {}
