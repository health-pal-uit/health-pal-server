import { Test, TestingModule } from '@nestjs/testing';
import { ContributionIngresService } from './contribution_ingres.service';

describe('ContributionIngresService', () => {
  let service: ContributionIngresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContributionIngresService],
    }).compile();

    service = module.get<ContributionIngresService>(ContributionIngresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
