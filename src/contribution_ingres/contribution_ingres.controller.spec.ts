import { Test, TestingModule } from '@nestjs/testing';
import { ContributionIngresController } from './contribution_ingres.controller';
import { ContributionIngresService } from './contribution_ingres.service';

describe('ContributionIngresController', () => {
  let controller: ContributionIngresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContributionIngresController],
      providers: [ContributionIngresService],
    }).compile();

    controller = module.get<ContributionIngresController>(ContributionIngresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
