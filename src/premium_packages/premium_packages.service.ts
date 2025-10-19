import { Injectable } from '@nestjs/common';
import { CreatePremiumPackageDto } from './dto/create-premium_package.dto';
import { UpdatePremiumPackageDto } from './dto/update-premium_package.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PremiumPackage } from './entities/premium_package.entity';
import { Repository } from 'typeorm';
import { DeleteResult } from 'typeorm';
import { UpdateResult } from 'typeorm';

@Injectable()
export class PremiumPackagesService {
  constructor(
    @InjectRepository(PremiumPackage) private premiumPackageRepository: Repository<PremiumPackage>,
  ) {}
  async create(createPremiumPackageDto: CreatePremiumPackageDto): Promise<PremiumPackage> {
    const premiumPackage = this.premiumPackageRepository.create(createPremiumPackageDto);
    return this.premiumPackageRepository.save(premiumPackage);
  }

  async findAll(): Promise<PremiumPackage[]> {
    return this.premiumPackageRepository.find();
  }

  async findOne(id: string): Promise<PremiumPackage | null> {
    return await this.premiumPackageRepository.findOneBy({ id });
  }

  async update(
    id: string,
    updatePremiumPackageDto: UpdatePremiumPackageDto,
  ): Promise<UpdateResult> {
    return await this.premiumPackageRepository.update(id, updatePremiumPackageDto);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.premiumPackageRepository.softDelete(id);
  }
}
