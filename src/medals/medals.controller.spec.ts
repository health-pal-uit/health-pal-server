import { Test, TestingModule } from '@nestjs/testing';
import { MedalsController } from './medals.controller';
import { MedalsService } from './medals.service';

describe('MedalsController', () => {
  let controller: MedalsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedalsController],
      providers: [MedalsService],
    }).compile();

    controller = module.get<MedalsController>(MedalsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
