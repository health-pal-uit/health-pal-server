import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MonthlyPaymentsService } from './monthly_payments.service';
import { CreateMonthlyPaymentDto } from './dto/create-monthly_payment.dto';
import { UpdateMonthlyPaymentDto } from './dto/update-monthly_payment.dto';

@Controller('monthly-payments')
export class MonthlyPaymentsController {
  constructor(private readonly monthlyPaymentsService: MonthlyPaymentsService) {}

  @Post()
  create(@Body() createMonthlyPaymentDto: CreateMonthlyPaymentDto) {
    return this.monthlyPaymentsService.create(createMonthlyPaymentDto);
  }

  @Get()
  findAll() {
    return this.monthlyPaymentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.monthlyPaymentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMonthlyPaymentDto: UpdateMonthlyPaymentDto) {
    return this.monthlyPaymentsService.update(+id, updateMonthlyPaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.monthlyPaymentsService.remove(+id);
  }
}
