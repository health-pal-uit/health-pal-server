import { Test, TestingModule } from '@nestjs/testing';
import { PostsMediasController } from './posts_medias.controller';
import { PostsMediasService } from './posts_medias.service';

describe('PostsMediasController', () => {
  let controller: PostsMediasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsMediasController],
      providers: [PostsMediasService],
    }).compile();

    controller = module.get<PostsMediasController>(PostsMediasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
