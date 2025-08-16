import { PartialType } from '@nestjs/mapped-types';
import { CreateDailyIngreDto } from './create-daily_ingre.dto';

export class UpdateDailyIngreDto extends PartialType(CreateDailyIngreDto) {}
