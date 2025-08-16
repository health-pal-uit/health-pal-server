import { Test, TestingModule } from '@nestjs/testing';
import { MonthlyPaymentsService } from './monthly_payments.service';

describe('MonthlyPaymentsService', () => {
  let service: MonthlyPaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MonthlyPaymentsService],
    }).compile();

    service = module.get<MonthlyPaymentsService>(MonthlyPaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
