import { Test, TestingModule } from '@nestjs/testing';
import { PostsMediasService } from './posts_medias.service';

describe('PostsMediasService', () => {
  let service: PostsMediasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsMediasService],
    }).compile();

    service = module.get<PostsMediasService>(PostsMediasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
