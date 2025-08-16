import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DailyIngresService } from './daily_ingres.service';
import { CreateDailyIngreDto } from './dto/create-daily_ingre.dto';
import { UpdateDailyIngreDto } from './dto/update-daily_ingre.dto';

@Controller('daily-ingres')
export class DailyIngresController {
  constructor(private readonly dailyIngresService: DailyIngresService) {}

  @Post()
  create(@Body() createDailyIngreDto: CreateDailyIngreDto) {
    return this.dailyIngresService.create(createDailyIngreDto);
  }

  @Get()
  findAll() {
    return this.dailyIngresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dailyIngresService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDailyIngreDto: UpdateDailyIngreDto) {
    return this.dailyIngresService.update(+id, updateDailyIngreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dailyIngresService.remove(+id);
  }
}
