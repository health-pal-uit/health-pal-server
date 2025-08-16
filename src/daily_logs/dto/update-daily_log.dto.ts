import { PartialType } from '@nestjs/mapped-types';
import { CreateDailyLogDto } from './create-daily_log.dto';

export class UpdateDailyLogDto extends PartialType(CreateDailyLogDto) {}
