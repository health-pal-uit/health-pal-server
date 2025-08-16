import { Test, TestingModule } from '@nestjs/testing';
import { DietTypesController } from './diet_types.controller';
import { DietTypesService } from './diet_types.service';

describe('DietTypesController', () => {
  let controller: DietTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DietTypesController],
      providers: [DietTypesService],
    }).compile();

    controller = module.get<DietTypesController>(DietTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
