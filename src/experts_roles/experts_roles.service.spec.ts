import { Test, TestingModule } from '@nestjs/testing';
import { ExpertsRolesService } from './experts_roles.service';

describe('ExpertsRolesService', () => {
  let service: ExpertsRolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpertsRolesService],
    }).compile();

    service = module.get<ExpertsRolesService>(ExpertsRolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
