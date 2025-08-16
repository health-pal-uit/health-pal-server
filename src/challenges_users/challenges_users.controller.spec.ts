import { Test, TestingModule } from '@nestjs/testing';
import { ChallengesUsersController } from './challenges_users.controller';
import { ChallengesUsersService } from './challenges_users.service';

describe('ChallengesUsersController', () => {
  let controller: ChallengesUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChallengesUsersController],
      providers: [ChallengesUsersService],
    }).compile();

    controller = module.get<ChallengesUsersController>(ChallengesUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
