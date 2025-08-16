import { Test, TestingModule } from '@nestjs/testing';
import { FavIngresService } from './fav_ingres.service';

describe('FavIngresService', () => {
  let service: FavIngresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FavIngresService],
    }).compile();

    service = module.get<FavIngresService>(FavIngresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
