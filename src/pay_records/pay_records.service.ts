import { Injectable } from '@nestjs/common';
import { CreatePayRecordDto } from './dto/create-pay_record.dto';
import { UpdatePayRecordDto } from './dto/update-pay_record.dto';

@Injectable()
export class PayRecordsService {
  create(createPayRecordDto: CreatePayRecordDto) {
    return 'This action adds a new payRecord';
  }

  findAll() {
    return `This action returns all payRecords`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payRecord`;
  }

  update(id: number, updatePayRecordDto: UpdatePayRecordDto) {
    return `This action updates a #${id} payRecord`;
  }

  remove(id: number) {
    return `This action removes a #${id} payRecord`;
  }
}
