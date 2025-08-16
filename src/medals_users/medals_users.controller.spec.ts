import { Test, TestingModule } from '@nestjs/testing';
import { MedalsUsersController } from './medals_users.controller';
import { MedalsUsersService } from './medals_users.service';

describe('MedalsUsersController', () => {
  let controller: MedalsUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedalsUsersController],
      providers: [MedalsUsersService],
    }).compile();

    controller = module.get<MedalsUsersController>(MedalsUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
