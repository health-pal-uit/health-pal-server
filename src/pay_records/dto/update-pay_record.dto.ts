import { PartialType } from '@nestjs/mapped-types';
import { CreatePayRecordDto } from './create-pay_record.dto';

export class UpdatePayRecordDto extends PartialType(CreatePayRecordDto) {}
