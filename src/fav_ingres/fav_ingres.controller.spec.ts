import { Test, TestingModule } from '@nestjs/testing';
import { FavIngresController } from './fav_ingres.controller';
import { FavIngresService } from './fav_ingres.service';

describe('FavIngresController', () => {
  let controller: FavIngresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavIngresController],
      providers: [FavIngresService],
    }).compile();

    controller = module.get<FavIngresController>(FavIngresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
