import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum ChallengeDifficulty{
    EASY = 'easy',
    MEDIUM = 'medium',
    HARD = 'hard'
}

@ApiSchema({name: Challenge.name, description: 'Challenge entity'})
@Entity('challenges')
export class Challenge {
    @ApiProperty({example: 'uuid', description: 'Unique identifier'})
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({example: 'New Challenge', description: 'Name of the challenge'})
    @Column('varchar', {length: 255, unique: true})
    name: string;

    @ApiProperty({example: 'This is a note', description: 'Additional notes about the challenge'})
    @Column('text', {nullable: true})
    note?: string;

    @ApiProperty({example: 'https://example.com/image.png', description: 'Image URL'})
    @Column('varchar', {length: 255, nullable: true})
    image_url?: string;

    @ApiProperty({example: 'easy', description: 'Difficulty level'})
    @Column('enum', {enum: ChallengeDifficulty})
    difficulty: ChallengeDifficulty;

    @ApiProperty({example: '2023-01-01', description: 'Creation date'})
    @Column('timestamptz', {default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;
}
