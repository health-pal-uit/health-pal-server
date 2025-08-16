import { Module } from '@nestjs/common';
import { PayRecordsService } from './pay_records.service';
import { PayRecordsController } from './pay_records.controller';

@Module({
  controllers: [PayRecordsController],
  providers: [PayRecordsService],
})
export class PayRecordsModule {}
