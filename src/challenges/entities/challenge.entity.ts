import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { ActivityRecord } from "src/activity_records/entities/activity_record.entity";
import { ChallengesMedal } from "src/challenges_medals/entities/challenges_medal.entity";
import { ChallengesUser } from "src/challenges_users/entities/challenges_user.entity";
import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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
    @Column('text', {nullable: true})
    image_url?: string;

    @ApiProperty({example: 'easy', description: 'Difficulty level'})
    @Column('enum', {enum: ChallengeDifficulty})
    difficulty: ChallengeDifficulty;

    @ApiProperty({example: '2023-01-01', description: 'Creation date'})
    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;
    
    // relations

    // reflects
    @OneToMany(() => ActivityRecord, (activityRecord) => activityRecord.challenge)
    activity_records: ActivityRecord[] | null;

    @OneToMany(() => ChallengesMedal, (challengesMedal) => challengesMedal.challenge)
    challenges_medals: ChallengesMedal[];

    @OneToMany(() => ChallengesUser, (challengesUser) => challengesUser.challenge)
    challenges_users: ChallengesUser[];
}
