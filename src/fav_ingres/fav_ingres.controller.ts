import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FavIngresService } from './fav_ingres.service';
import { CreateFavIngreDto } from './dto/create-fav_ingre.dto';
import { UpdateFavIngreDto } from './dto/update-fav_ingre.dto';

@Controller('fav-ingres')
export class FavIngresController {
  constructor(private readonly favIngresService: FavIngresService) {}

  @Post()
  create(@Body() createFavIngreDto: CreateFavIngreDto) {
    return this.favIngresService.create(createFavIngreDto);
  }

  @Get()
  findAll() {
    return this.favIngresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.favIngresService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFavIngreDto: UpdateFavIngreDto) {
    return this.favIngresService.update(+id, updateFavIngreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.favIngresService.remove(+id);
  }
}
