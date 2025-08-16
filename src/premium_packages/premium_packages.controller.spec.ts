import { Test, TestingModule } from '@nestjs/testing';
import { PremiumPackagesController } from './premium_packages.controller';
import { PremiumPackagesService } from './premium_packages.service';

describe('PremiumPackagesController', () => {
  let controller: PremiumPackagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PremiumPackagesController],
      providers: [PremiumPackagesService],
    }).compile();

    controller = module.get<PremiumPackagesController>(PremiumPackagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
