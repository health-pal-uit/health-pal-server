import { Test, TestingModule } from '@nestjs/testing';
import { MedalsUsersService } from './medals_users.service';

describe('MedalsUsersService', () => {
  let service: MedalsUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedalsUsersService],
    }).compile();

    service = module.get<MedalsUsersService>(MedalsUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
