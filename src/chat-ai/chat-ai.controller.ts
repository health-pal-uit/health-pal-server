import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ChatAiService } from './chat-ai.service';
import { ChatDto } from './dto/chat.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('chat-ai')
@ApiBearerAuth()
@ApiTags('chat-ai')
export class ChatAiController {
  constructor(private readonly chatAiService: ChatAiService) {}

  @Post()
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Chat with AI assistant',
    description:
      'Sends a message with or without history to the AI chat assistant and receives a response.',
  })
  async chat(@Body() dto: ChatDto) {
    return await this.chatAiService.chat(dto);
  }
}
