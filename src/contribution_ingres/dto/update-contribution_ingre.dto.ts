import { PartialType } from '@nestjs/swagger';
import { CreateContributionIngreDto } from './create-contribution_ingre.dto';

export class UpdateContributionIngreDto extends PartialType(CreateContributionIngreDto) {}
