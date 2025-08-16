import { Test, TestingModule } from '@nestjs/testing';
import { ActivityRecordsService } from './activity_records.service';

describe('ActivityRecordsService', () => {
  let service: ActivityRecordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityRecordsService],
    }).compile();

    service = module.get<ActivityRecordsService>(ActivityRecordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
