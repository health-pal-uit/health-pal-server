import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ContributionIngresService } from './contribution_ingres.service';
import { CreateContributionIngreDto } from './dto/create-contribution_ingre.dto';
import { UpdateContributionIngreDto } from './dto/update-contribution_ingre.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';

@Controller('contribution-ingres')
export class ContributionIngresController {
  constructor(private readonly contributionIngresService: ContributionIngresService) {}

  @Post() // user -> create new contribution
  @UseGuards(SupabaseGuard)
  create(@Body() createContributionIngreDto: CreateContributionIngreDto, @CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    if (isAdmin) {
      throw new Error('Admins cannot create contributions');
    }
    return this.contributionIngresService.create(createContributionIngreDto, user.id);
  }

  @Get() // admin
  @UseGuards(SupabaseGuard)
  findAll(@CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      return this.contributionIngresService.findAllUser(user.id); // only their contributions
    }
    return this.contributionIngresService.findAll();
  }

  @Get(':id') // admin
  @UseGuards(SupabaseGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      return this.contributionIngresService.findOneUser(id, user.id);
    }
    return this.contributionIngresService.findOne(id);
  }

  @Patch(':id') // user => create update contribution
  @UseGuards(SupabaseGuard)
  update(
    @Param('id') id: string,
    @Body() updateContributionIngreDto: UpdateContributionIngreDto,
    @CurrentUser() user: any,
  ) {
    // check if user or admin
    const isAdmin = user.role === 'admin';
    if (isAdmin) {
      throw new Error('Admins cannot create update contributions');
    }
    return this.contributionIngresService.createUpdateContribution(
      id,
      updateContributionIngreDto,
      user.id,
    );
  }

  @Delete(':id') // user => create delete contribution
  @UseGuards(SupabaseGuard)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    if (isAdmin) {
      return this.contributionIngresService.remove(id);
    }
    return this.contributionIngresService.createDeleteContribution(id, user.id);
  }

  // admin approve

  @Get('approve/:id') // admin => approve contribution
  @UseGuards(AdminSupabaseGuard)
  approve(@Param('id') id: string) {
    return this.contributionIngresService.adminApprove(id);
  }

  @Get('reject/:id') // admin => reject contribution
  @UseGuards(AdminSupabaseGuard)
  reject(@Param('id') id: string) {
    return this.contributionIngresService.adminReject(id);
  }

  @Get('pending') // admin => get all pending contributions
  @UseGuards(AdminSupabaseGuard)
  pending() {
    return this.contributionIngresService.findAllPending();
  }
}
