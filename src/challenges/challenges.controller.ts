import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';

@ApiTags('challenges')
@ApiBearerAuth()
@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @ApiOperation({
    summary: 'Create a new challenge (Admin only)',
    description:
      'Creates a new challenge with optional image upload. Can assign activity records to the challenge. Requires admin authentication.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Challenge created successfully with activity records assigned',
    schema: {
      example: {
        id: 'uuid',
        name: '30-Day Running Challenge',
        note: 'Run 5km every day for 30 days',
        image_url: 'https://storage.example.com/challenge.jpg',
        difficulty: 'hard',
        created_at: '2025-11-23T10:00:00Z',
        activity_records: [],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Admin access required' })
  @ApiResponse({ status: 404, description: 'Activity record not found' })
  @Post()
  @UseGuards(AdminSupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createChallengeDto: CreateChallengeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageBuffer = file?.buffer;
    const imageName = file?.originalname;
    return await this.challengesService.create(createChallengeDto, imageBuffer, imageName);
  }

  @ApiOperation({
    summary: 'Get all active challenges',
    description:
      'Retrieves all non-deleted challenges with their associated activity records. Available to all authenticated users.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of all challenges (excluding soft-deleted)',
    schema: {
      example: [
        {
          id: 'uuid-1',
          name: 'Morning Yoga Challenge',
          note: 'Practice yoga every morning',
          image_url: 'https://storage.example.com/yoga.jpg',
          difficulty: 'easy',
          created_at: '2025-11-20T08:00:00Z',
          activity_records: [],
        },
        {
          id: 'uuid-2',
          name: 'Weight Loss Challenge',
          note: 'Lose 5kg in 2 months',
          image_url: 'https://storage.example.com/weightloss.jpg',
          difficulty: 'medium',
          created_at: '2025-11-15T09:00:00Z',
          activity_records: [],
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  @UseGuards(SupabaseGuard)
  async findAll() {
    return await this.challengesService.findAll();
  }

  @ApiOperation({
    summary: 'Get a specific challenge by ID',
    description:
      "Retrieves detailed information about a specific challenge including its activity records. Returns 404 if challenge is deleted or doesn't exist.",
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the challenge details',
    schema: {
      example: {
        id: 'uuid',
        name: '30-Day Running Challenge',
        note: 'Run 5km every day for 30 days',
        image_url: 'https://storage.example.com/challenge.jpg',
        difficulty: 'hard',
        created_at: '2025-11-23T10:00:00Z',
        activity_records: [
          {
            id: 'record-uuid',
            duration_minutes: 30,
            reps: null,
            sets: null,
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get(':id')
  @UseGuards(SupabaseGuard)
  async findOne(@Param('id') id: string) {
    return await this.challengesService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update a challenge (Admin only)',
    description:
      'Updates an existing challenge. Supports partial updates and optional image replacement. Requires admin authentication.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Challenge updated successfully',
    schema: {
      example: {
        id: 'uuid',
        name: 'Updated Challenge Name',
        note: 'Updated description',
        image_url: 'https://storage.example.com/new-image.jpg',
        difficulty: 'medium',
        created_at: '2025-11-23T10:00:00Z',
        activity_records: [],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Admin access required' })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  @Patch(':id')
  @UseGuards(AdminSupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateChallengeDto: UpdateChallengeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageBuffer = file?.buffer;
    const imageName = file?.originalname;
    return await this.challengesService.update(id, updateChallengeDto, imageBuffer, imageName);
  }

  @ApiOperation({
    summary: 'Soft delete a challenge (Admin only)',
    description:
      'Soft deletes a challenge by setting deleted_at timestamp. The challenge will no longer appear in listings but data is preserved. Requires admin authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Challenge soft deleted successfully',
    schema: {
      example: {
        id: 'uuid',
        name: '30-Day Running Challenge',
        note: 'Run 5km every day for 30 days',
        image_url: 'https://storage.example.com/challenge.jpg',
        difficulty: 'hard',
        created_at: '2025-11-23T10:00:00Z',
        activity_records: [],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Admin access required' })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  @Delete(':id')
  @UseGuards(AdminSupabaseGuard)
  async remove(@Param('id') id: string) {
    return await this.challengesService.remove(id);
  }
}
