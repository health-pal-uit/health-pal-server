import { Test, TestingModule } from '@nestjs/testing';
import { DailyIngresService } from './daily_ingres.service';

describe('DailyIngresService', () => {
  let service: DailyIngresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyIngresService],
    }).compile();

    service = module.get<DailyIngresService>(DailyIngresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
