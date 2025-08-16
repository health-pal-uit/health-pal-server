import { Test, TestingModule } from '@nestjs/testing';
import { PremiumPackagesService } from './premium_packages.service';

describe('PremiumPackagesService', () => {
  let service: PremiumPackagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PremiumPackagesService],
    }).compile();

    service = module.get<PremiumPackagesService>(PremiumPackagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
