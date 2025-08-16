import { PartialType } from '@nestjs/mapped-types';
import { CreateFavIngreDto } from './create-fav_ingre.dto';

export class UpdateFavIngreDto extends PartialType(CreateFavIngreDto) {}
