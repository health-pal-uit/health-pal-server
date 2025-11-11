import { Module } from '@nestjs/common';
import { GoogleFitService } from './google-fit.service';
import { GoogleFitController } from './google-fit.controller';
import { User } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [GoogleFitController],
  providers: [GoogleFitService],
})
export class GoogleFitModule {}
