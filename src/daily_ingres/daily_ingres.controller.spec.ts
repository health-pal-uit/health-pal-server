import { Test, TestingModule } from '@nestjs/testing';
import { DailyIngresController } from './daily_ingres.controller';
import { DailyIngresService } from './daily_ingres.service';

describe('DailyIngresController', () => {
  let controller: DailyIngresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyIngresController],
      providers: [DailyIngresService],
    }).compile();

    controller = module.get<DailyIngresController>(DailyIngresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
