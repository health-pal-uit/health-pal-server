import { PartialType } from '@nestjs/mapped-types';
import { CreatePremiumPackageDto } from './create-premium_package.dto';

export class UpdatePremiumPackageDto extends PartialType(CreatePremiumPackageDto) {}
