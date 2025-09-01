import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ApiSchema({name: ChallengesUser.name, description: 'Challenges User entity'})
@Entity('challenges_users')
export class ChallengesUser {
    @ApiProperty({example: 'uuid', description: 'Unique identifier'})
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({example: new Date(), description: 'Date when the challenge was achieved'})
    @Column('timestamptz')
    achieved_at: Date;
}
