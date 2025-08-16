import { Module } from '@nestjs/common';
import { FavIngresService } from './fav_ingres.service';
import { FavIngresController } from './fav_ingres.controller';

@Module({
  controllers: [FavIngresController],
  providers: [FavIngresService],
})
export class FavIngresModule {}
