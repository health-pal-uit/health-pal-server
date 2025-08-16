import { Module } from '@nestjs/common';
import { PremiumPackagesService } from './premium_packages.service';
import { PremiumPackagesController } from './premium_packages.controller';

@Module({
  controllers: [PremiumPackagesController],
  providers: [PremiumPackagesService],
})
export class PremiumPackagesModule {}
