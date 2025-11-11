import { Test, TestingModule } from '@nestjs/testing';
import { GoogleFitController } from './google-fit.controller';
import { GoogleFitService } from './google-fit.service';

describe('GoogleFitController', () => {
  let controller: GoogleFitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleFitController],
      providers: [GoogleFitService],
    }).compile();

    controller = module.get<GoogleFitController>(GoogleFitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
