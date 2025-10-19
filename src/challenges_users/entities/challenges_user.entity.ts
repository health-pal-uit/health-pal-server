import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { ActivityRecord } from 'src/activity_records/entities/activity_record.entity';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@ApiSchema({ name: ChallengesUser.name, description: 'Challenges User entity' })
@Unique('UQ_challenges_users_user_challenge', ['user', 'challenge'])
@Entity('challenges_users')
export class ChallengesUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('timestamptz')
  achieved_at: Date;

  @Column({ type: 'float', nullable: true })
  progress_percent?: number;

  // relations => 2

  @ManyToOne(() => User, (user) => user.challenges_users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Challenge, (challenge) => challenge.challenges_users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'challenge_id' })
  challenge: Challenge;

  // reflect
  @OneToMany(() => ActivityRecord, (activity_record) => activity_record.challenge_user)
  activity_records: ActivityRecord[];
}
