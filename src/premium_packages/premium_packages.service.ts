import { Injectable } from '@nestjs/common';
import { CreatePremiumPackageDto } from './dto/create-premium_package.dto';
import { UpdatePremiumPackageDto } from './dto/update-premium_package.dto';

@Injectable()
export class PremiumPackagesService {
  create(createPremiumPackageDto: CreatePremiumPackageDto) {
    return 'This action adds a new premiumPackage';
  }

  findAll() {
    return `This action returns all premiumPackages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} premiumPackage`;
  }

  update(id: number, updatePremiumPackageDto: UpdatePremiumPackageDto) {
    return `This action updates a #${id} premiumPackage`;
  }

  remove(id: number) {
    return `This action removes a #${id} premiumPackage`;
  }
}
