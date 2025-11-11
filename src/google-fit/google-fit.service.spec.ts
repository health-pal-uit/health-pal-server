import { Test, TestingModule } from '@nestjs/testing';
import { GoogleFitService } from './google-fit.service';

describe('GoogleFitService', () => {
  let service: GoogleFitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleFitService],
    }).compile();

    service = module.get<GoogleFitService>(GoogleFitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
