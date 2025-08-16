import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PayRecordsService } from './pay_records.service';
import { CreatePayRecordDto } from './dto/create-pay_record.dto';
import { UpdatePayRecordDto } from './dto/update-pay_record.dto';

@Controller('pay-records')
export class PayRecordsController {
  constructor(private readonly payRecordsService: PayRecordsService) {}

  @Post()
  create(@Body() createPayRecordDto: CreatePayRecordDto) {
    return this.payRecordsService.create(createPayRecordDto);
  }

  @Get()
  findAll() {
    return this.payRecordsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payRecordsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePayRecordDto: UpdatePayRecordDto) {
    return this.payRecordsService.update(+id, updatePayRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payRecordsService.remove(+id);
  }
}
