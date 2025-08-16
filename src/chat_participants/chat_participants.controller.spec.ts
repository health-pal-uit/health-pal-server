import { Test, TestingModule } from '@nestjs/testing';
import { ChatParticipantsController } from './chat_participants.controller';
import { ChatParticipantsService } from './chat_participants.service';

describe('ChatParticipantsController', () => {
  let controller: ChatParticipantsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatParticipantsController],
      providers: [ChatParticipantsService],
    }).compile();

    controller = module.get<ChatParticipantsController>(ChatParticipantsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
