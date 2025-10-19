import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { ActivityRecord } from 'src/activity_records/entities/activity_record.entity';
import { ChallengesMedal } from 'src/challenges_medals/entities/challenges_medal.entity';
import { ChallengesUser } from 'src/challenges_users/entities/challenges_user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChallengeDifficulty } from 'src/helpers/enums/challenge-difficulty.enum';

@ApiSchema({ name: Challenge.name, description: 'Challenge entity' })
@Entity('challenges')
export class Challenge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255, unique: true })
  name: string;

  @Column('text', { nullable: true })
  note?: string;

  @Column('text', { nullable: true })
  image_url?: string;

  @Column('enum', { enum: ChallengeDifficulty })
  difficulty: ChallengeDifficulty;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date | null;

  // relations

  // reflects
  @OneToMany(() => ActivityRecord, (activityRecord) => activityRecord.challenge)
  activity_records: ActivityRecord[] | null;

  @OneToMany(() => ChallengesMedal, (challengesMedal) => challengesMedal.challenge)
  challenges_medals: ChallengesMedal[];

  @OneToMany(() => ChallengesUser, (challengesUser) => challengesUser.challenge)
  challenges_users: ChallengesUser[];
}
