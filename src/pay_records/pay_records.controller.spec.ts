import { Test, TestingModule } from '@nestjs/testing';
import { PayRecordsController } from './pay_records.controller';
import { PayRecordsService } from './pay_records.service';

describe('PayRecordsController', () => {
  let controller: PayRecordsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayRecordsController],
      providers: [PayRecordsService],
    }).compile();

    controller = module.get<PayRecordsController>(PayRecordsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
