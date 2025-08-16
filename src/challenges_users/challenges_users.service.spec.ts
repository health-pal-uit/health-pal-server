import { Test, TestingModule } from '@nestjs/testing';
import { ChallengesUsersService } from './challenges_users.service';

describe('ChallengesUsersService', () => {
  let service: ChallengesUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChallengesUsersService],
    }).compile();

    service = module.get<ChallengesUsersService>(ChallengesUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
