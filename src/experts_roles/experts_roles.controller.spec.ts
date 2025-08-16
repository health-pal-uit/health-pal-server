import { Test, TestingModule } from '@nestjs/testing';
import { ExpertsRolesController } from './experts_roles.controller';
import { ExpertsRolesService } from './experts_roles.service';

describe('ExpertsRolesController', () => {
  let controller: ExpertsRolesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpertsRolesController],
      providers: [ExpertsRolesService],
    }).compile();

    controller = module.get<ExpertsRolesController>(ExpertsRolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
