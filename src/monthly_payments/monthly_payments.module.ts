import { Module } from '@nestjs/common';
import { MonthlyPaymentsService } from './monthly_payments.service';
import { MonthlyPaymentsController } from './monthly_payments.controller';

@Module({
  controllers: [MonthlyPaymentsController],
  providers: [MonthlyPaymentsService],
})
export class MonthlyPaymentsModule {}
