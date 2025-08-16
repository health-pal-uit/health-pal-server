import { PartialType } from '@nestjs/mapped-types';
import { CreateDietTypeDto } from './create-diet_type.dto';

export class UpdateDietTypeDto extends PartialType(CreateDietTypeDto) {}
