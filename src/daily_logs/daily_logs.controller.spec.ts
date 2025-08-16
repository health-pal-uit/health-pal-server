import { Test, TestingModule } from '@nestjs/testing';
import { DailyLogsController } from './daily_logs.controller';
import { DailyLogsService } from './daily_logs.service';

describe('DailyLogsController', () => {
  let controller: DailyLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyLogsController],
      providers: [DailyLogsService],
    }).compile();

    controller = module.get<DailyLogsController>(DailyLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
