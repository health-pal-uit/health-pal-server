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
import { ContributionIngresService } from './contribution_ingres.service';
import { CreateContributionIngreDto } from './dto/create-contribution_ingre.dto';
import { UpdateContributionIngreDto } from './dto/update-contribution_ingre.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('contribution-ingres')
export class ContributionIngresController {
  constructor(private readonly contributionIngresService: ContributionIngresService) {}

  @Post() // user -> create new contribution
  @UseGuards(SupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createContributionIngreDto: CreateContributionIngreDto,
    @CurrentUser() user: any,
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

  @Get() // admin
  @UseGuards(SupabaseGuard)
  async findAll(@CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      return await this.contributionIngresService.findAllUser(user.id); // only their contributions
    }
    return await this.contributionIngresService.findAll();
  }

  @Get(':id') // admin
  @UseGuards(SupabaseGuard)
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      return await this.contributionIngresService.findOneUser(id, user.id);
    }
    return await this.contributionIngresService.findOne(id);
  }

  @Patch(':id') // user => create update contribution
  @UseGuards(SupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateContributionIngreDto: UpdateContributionIngreDto,
    @CurrentUser() user: any,
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
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    if (isAdmin) {
      return await this.contributionIngresService.remove(id);
    }
    return await this.contributionIngresService.createDeleteContribution(id, user.id);
  }

  // admin approve

  @Get('approve/:id') // admin => approve contribution
  @UseGuards(AdminSupabaseGuard)
  async approve(@Param('id') id: string) {
    return await this.contributionIngresService.adminApprove(id);
  }

  @Get('reject/:id') // admin => reject contribution
  @UseGuards(AdminSupabaseGuard)
  async reject(@Param('id') id: string) {
    return await this.contributionIngresService.adminReject(id);
  }

  @Get('pending') // admin => get all pending contributions
  @UseGuards(AdminSupabaseGuard)
  async pending() {
    return await this.contributionIngresService.findAllPending();
  }
}
