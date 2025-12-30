import { ApiSchema } from '@nestjs/swagger';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

@ApiSchema({ name: ChallengesUser.name, description: 'Challenges User entity' })
@Unique('UQ_challenges_users_user_challenge', ['user', 'challenge'])
@Entity('challenges_users')
export class ChallengesUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  joined_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completed_at?: Date | null;

  @Column({ type: 'float', default: 0 })
  progress_percent: number;

  // relations => 2

  @ManyToOne(() => User, (user) => user.challenges_users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Challenge, (challenge) => challenge.challenges_users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'challenge_id' })
  challenge: Challenge;
}
