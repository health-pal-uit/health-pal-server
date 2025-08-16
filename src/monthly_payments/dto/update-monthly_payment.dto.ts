import { PartialType } from '@nestjs/mapped-types';
import { CreateMonthlyPaymentDto } from './create-monthly_payment.dto';

export class UpdateMonthlyPaymentDto extends PartialType(CreateMonthlyPaymentDto) {}
