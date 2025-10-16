import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FavIngresService } from './fav_ingres.service';
import { CreateFavIngreDto } from './dto/create-fav_ingre.dto';
import { UpdateFavIngreDto } from './dto/update-fav_ingre.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUserId } from 'src/helpers/decorators/current-user-id.decorator';

@Controller('fav-ingres')
export class FavIngresController {
  constructor(private readonly favIngresService: FavIngresService) {}

  @Post()
  @UseGuards(SupabaseGuard)
  create(@Body() createFavIngreDto: CreateFavIngreDto) {
    return this.favIngresService.create(createFavIngreDto);
  }

  // find all of a user
  @Get('user')
  @UseGuards(SupabaseGuard)
  findAllOfUser(@CurrentUserId() userId: string) {
    return this.favIngresService.findAllOfUser(userId);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  remove(@Param('id') id: string) {
    return this.favIngresService.remove(id);
  }
}
