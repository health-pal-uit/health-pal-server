import { Test, TestingModule } from '@nestjs/testing';
import { ActivityRecordsController } from './activity_records.controller';
import { ActivityRecordsService } from './activity_records.service';

describe('ActivityRecordsController', () => {
  let controller: ActivityRecordsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityRecordsController],
      providers: [ActivityRecordsService],
    }).compile();

    controller = module.get<ActivityRecordsController>(ActivityRecordsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
