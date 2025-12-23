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
  Query,
} from '@nestjs/common';
import { ContributionIngrePaginationDto } from './dto/contribution-ingre-pagination.dto';
import { ContributionIngresService } from './contribution_ingres.service';
import { CreateContributionIngreDto } from './dto/create-contribution_ingre.dto';
import { UpdateContributionIngreDto } from './dto/update-contribution_ingre.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
import type { ReqUserType } from 'src/auth/types/req.type';

@ApiBearerAuth()
@Controller('contribution-ingres')
export class ContributionIngresController {
  constructor(private readonly contributionIngresService: ContributionIngresService) {}

  @Post() // user -> create new contribution
  @UseGuards(SupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'User creates a new ingredient contribution' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Contribution data and optional image',
    type: CreateContributionIngreDto,
  })
  @ApiResponse({ status: 201, description: 'Contribution created' })
  @ApiResponse({ status: 403, description: 'Admins cannot create contributions' })
  async create(
    @Body() createContributionIngreDto: CreateContributionIngreDto,
    @CurrentUser() user: ReqUserType,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const isAdmin = user.role === 'admin';
    if (isAdmin) {
      throw new Error('Admins cannot create contributions');
    }
    const imageBuffer = file?.buffer;
    const imageName = file?.originalname;
    return await this.contributionIngresService.create(
      createContributionIngreDto,
      user.id,
      imageBuffer,
      imageName,
    );
  }

  @Get('pending') // admin => get all pending contributions
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Admin gets all pending contributions' })
  @ApiResponse({ status: 200, description: 'List of pending contributions' })
  async pending(@Query() query: ContributionIngrePaginationDto) {
    const { page = 1, limit = 10 } = query;
    return await this.contributionIngresService.findAllPending(page, limit);
  }

  @Get('rejected') // admin => get all rejected contributions
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Admin gets all rejected ingredient contributions' })
  @ApiResponse({ status: 200, description: 'List of rejected contributions' })
  async rejected(@Query() query: ContributionIngrePaginationDto) {
    const { page = 1, limit = 10 } = query;
    return await this.contributionIngresService.findAllRejected(page, limit);
  }

  @Get('rejection-info/:id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'User gets rejection reason/status for their own contribution' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Rejection info' })
  async getRejectionInfo(@Param('id') id: string, @CurrentUser() user: ReqUserType) {
    // Only allow user to see their own contribution's rejection info
    return await this.contributionIngresService.getRejectionInfo(id, user.id);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'List all contributions (admin) or user contributions (user)' })
  @ApiResponse({ status: 200, description: 'List of contributions' })
  async findAll(@CurrentUser() user: ReqUserType, @Query() query: ContributionIngrePaginationDto) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      return await this.contributionIngresService.findAllUser(user.id); // only their contributions
    }
    const { page = 1, limit = 10 } = query;
    return await this.contributionIngresService.findAll(page, limit);
  }

  @Get(':id') // admin
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get a contribution by id (admin or user)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Contribution detail' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Param('id') id: string, @CurrentUser() user: ReqUserType) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      return await this.contributionIngresService.findOneUser(id, user.id);
    }
    return await this.contributionIngresService.findOne(id);
  }

  @Patch(':id') // user => create update contribution
  @UseGuards(SupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'User updates their pending contribution' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update data and optional image',
    type: UpdateContributionIngreDto,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Contribution updated' })
  @ApiResponse({ status: 403, description: 'Admins cannot update contributions' })
  async update(
    @Param('id') id: string,
    @Body() updateContributionIngreDto: UpdateContributionIngreDto,
    @CurrentUser() user: ReqUserType,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // check if user or admin
    const isAdmin = user.role === 'admin';
    if (isAdmin) {
      throw new Error('Admins cannot create update contributions');
    }
    const imageBuffer = file?.buffer;
    const imageName = file?.originalname;
    return await this.contributionIngresService.createUpdateContribution(
      id,
      updateContributionIngreDto,
      user.id,
      imageBuffer,
      imageName,
    );
  }

  @Delete(':id') // user => create delete contribution
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'User deletes their pending contribution or admin hard deletes' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Contribution deleted' })
  async remove(@Param('id') id: string, @CurrentUser() user: ReqUserType) {
    const isAdmin = user.role === 'admin';
    if (isAdmin) {
      return await this.contributionIngresService.remove(id);
    }
    return await this.contributionIngresService.createDeleteContribution(id, user.id);
  }

  // admin approve

  @Patch(':id/approve') // admin => approve contribution
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Admin approves a contribution' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Contribution approved' })
  async approve(@Param('id') id: string) {
    return await this.contributionIngresService.adminApprove(id);
  }

  @Patch(':id/reject') // admin => reject contribution with reason
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Admin rejects a contribution with a reason' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ schema: { properties: { rejection_reason: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Contribution rejected' })
  async reject(@Param('id') id: string, @Body('rejection_reason') reason: string) {
    return await this.contributionIngresService.adminReject(id, reason);
  }
}
