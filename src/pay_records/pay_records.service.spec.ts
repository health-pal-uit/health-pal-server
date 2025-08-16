import { Test, TestingModule } from '@nestjs/testing';
import { PayRecordsService } from './pay_records.service';

describe('PayRecordsService', () => {
  let service: PayRecordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayRecordsService],
    }).compile();

    service = module.get<PayRecordsService>(PayRecordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
