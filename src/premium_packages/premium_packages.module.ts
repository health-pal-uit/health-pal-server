import { Module } from '@nestjs/common';
import { PremiumPackagesService } from './premium_packages.service';
import { PremiumPackagesController } from './premium_packages.controller';
import { PremiumPackage } from './entities/premium_package.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([PremiumPackage])],
  controllers: [PremiumPackagesController],
  providers: [PremiumPackagesService],
})
export class PremiumPackagesModule {}
