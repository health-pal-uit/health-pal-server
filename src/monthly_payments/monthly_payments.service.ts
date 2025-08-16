import { Injectable } from '@nestjs/common';
import { CreateMonthlyPaymentDto } from './dto/create-monthly_payment.dto';
import { UpdateMonthlyPaymentDto } from './dto/update-monthly_payment.dto';

@Injectable()
export class MonthlyPaymentsService {
  create(createMonthlyPaymentDto: CreateMonthlyPaymentDto) {
    return 'This action adds a new monthlyPayment';
  }

  findAll() {
    return `This action returns all monthlyPayments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} monthlyPayment`;
  }

  update(id: number, updateMonthlyPaymentDto: UpdateMonthlyPaymentDto) {
    return `This action updates a #${id} monthlyPayment`;
  }

  remove(id: number) {
    return `This action removes a #${id} monthlyPayment`;
  }
}
