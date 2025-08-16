import { PartialType } from '@nestjs/mapped-types';
import { CreateChallengesUserDto } from './create-challenges_user.dto';

export class UpdateChallengesUserDto extends PartialType(CreateChallengesUserDto) {}
