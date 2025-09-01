import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn } from "typeorm";

@ApiSchema({name: ChallengesMedal.name, description: 'Challenges Medal entity'})
@Entity('challenges_medals')
export class ChallengesMedal {
    @ApiProperty({example: 'uuid', description: 'Unique identifier'})
    @PrimaryGeneratedColumn('uuid')
    id: string;
}
