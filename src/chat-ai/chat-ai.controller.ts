import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ChatAiService } from './chat-ai.service';
import { ChatDto } from './dto/chat.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';

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

  @Post('generate-imgs/ingre')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({
    summary: 'Generate images for popular ingredients',
    description:
      'Uses Gemini image generation to produce inline images for common ingredients (not stored; returned as base64).',
  })
  async generateImagesForIngredients() {
    return await this.chatAiService.generateImagesForIngredients();
  }

  @Post('generate-imgs/test')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({
    summary: 'Test Gemini image generation',
    description:
      'Attempts to generate a single test image with the configured GEMINI_IMAGE_MODEL (or an optional override). Returns base64 data URI if successful.',
  })
  async testGenerateImage(@Body('model') model?: string) {
    const data = await this.chatAiService.testGenerateImage(model);
    return {
      message: data ? 'Image generated' : 'Image not generated',
      model: model || 'configured',
      image: data,
    };
  }
}
