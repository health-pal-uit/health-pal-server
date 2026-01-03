import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { responseHelper } from 'src/helpers/responses/response.helper';
import { MealRecommendationRequestDto } from './dto/meal-recommendation-request.dto';
import { MealRecommendationResponseDto } from './dto/meal-recommendation-response.dto';
import type { ReqUserType } from 'src/auth/types/req.type';

@Controller('recommendations')
@ApiBearerAuth()
@ApiTags('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get()
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Get personalized fitness goal recommendations for the authenticated user',
  })
  @ApiOkResponse({
    description: 'Personalized fitness goal recommendations retrieved successfully.',
  })
  async getRecommendations(@CurrentUser() user: ReqUserType) {
    const data = await this.recommendationsService.getRecommendations(user.id);
    return responseHelper({
      data,
      message: 'Personalized fitness goal recommendations retrieved successfully.',
      statusCode: 200,
    });
  }

  @Post('apply-to-fitness-goal')
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Get personalized fitness goal recommendations and apply to create a new fitness goal',
  })
  @ApiOkResponse({ description: 'Personalized fitness goal created successfully.' })
  async applyRecommendationsToFitnessGoal(@CurrentUser() user: ReqUserType) {
    const recommendedGoal = await this.recommendationsService.getRecommendations(user.id);
    const data = await this.recommendationsService.applyRecommendationsToFitnessGoal(
      user.id,
      recommendedGoal,
    );
    return responseHelper({
      data,
      message: 'Personalized fitness goal created successfully.',
      statusCode: 200,
    });
  }

  @Post('meals')
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Get AI-powered meal recommendations based on user query and fitness goals',
    description:
      'Ask in natural language what to eat (e.g., "What should I eat for dinner? I have chicken and rice") and get personalized meal suggestions with psychological safety considerations.',
  })
  @ApiOkResponse({
    description: 'Meal recommendations generated successfully.',
    type: MealRecommendationResponseDto,
  })
  async getMealRecommendations(
    @CurrentUser() user: ReqUserType,
    @Body() requestDto: MealRecommendationRequestDto,
  ) {
    const data = await this.recommendationsService.getMealRecommendations(user.id, requestDto);
    return responseHelper({
      data,
      message: 'Meal recommendations generated successfully.',
      statusCode: 200,
    });
  }
}
