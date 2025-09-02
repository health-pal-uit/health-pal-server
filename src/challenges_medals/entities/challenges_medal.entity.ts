import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Challenge } from "src/challenges/entities/challenge.entity";
import { Medal } from "src/medals/entities/medal.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@ApiSchema({name: ChallengesMedal.name, description: 'Challenges Medal entity'})
@Unique('UQ_challenges_medals_challenge_medal', ['challenge', 'medal'])
@Entity('challenges_medals')
export class ChallengesMedal {
    @ApiProperty({example: 'uuid', description: 'Unique identifier'})
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // relations => 2
    @ManyToOne(() => Challenge, (challenge) => challenge.challenges_medals, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'challenge_id' })
    challenge: Challenge

    @ManyToOne(() => Medal, (medal) => medal.challenges_medals, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'medal_id' })
    medal: Medal;
}
