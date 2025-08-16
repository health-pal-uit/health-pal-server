import { Test, TestingModule } from '@nestjs/testing';
import { DietTypesService } from './diet_types.service';

describe('DietTypesService', () => {
  let service: DietTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DietTypesService],
    }).compile();

    service = module.get<DietTypesService>(DietTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
