import { PartialType } from '@nestjs/mapped-types';
import { CreateChallengesMedalDto } from './create-challenges_medal.dto';

export class UpdateChallengesMedalDto extends PartialType(CreateChallengesMedalDto) {}
