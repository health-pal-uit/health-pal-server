import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Challenge } from "src/challenges/entities/challenge.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@ApiSchema({name: ChallengesUser.name, description: 'Challenges User entity'})
@Unique('UQ_challenges_users_user_challenge', ['user', 'challenge'])
@Entity('challenges_users')
export class ChallengesUser {
    @ApiProperty({example: 'uuid', description: 'Unique identifier'})
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({example: new Date(), description: 'Date when the challenge was achieved'})
    @Column('timestamptz')
    achieved_at: Date;

    // relations => 2

    @ManyToOne(() => User, (user) => user.challenges_users, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Challenge, (challenge) => challenge.challenges_users, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'challenge_id' })
    challenge: Challenge;
}
