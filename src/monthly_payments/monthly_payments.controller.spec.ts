import { Test, TestingModule } from '@nestjs/testing';
import { MonthlyPaymentsController } from './monthly_payments.controller';
import { MonthlyPaymentsService } from './monthly_payments.service';

describe('MonthlyPaymentsController', () => {
  let controller: MonthlyPaymentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonthlyPaymentsController],
      providers: [MonthlyPaymentsService],
    }).compile();

    controller = module.get<MonthlyPaymentsController>(MonthlyPaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
