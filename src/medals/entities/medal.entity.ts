import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { ChallengesMedal } from 'src/challenges_medals/entities/challenges_medal.entity';
import { MedalsUser } from 'src/medals_users/entities/medals_user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MedalTier } from 'src/helpers/enums/medal-tier.enum';
import { Post } from 'src/posts/entities/post.entity';

@ApiSchema({ name: Medal.name, description: 'Medal entity' })
@Entity('medals')
export class Medal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255, unique: true })
  name: string;

  @Column('text', { nullable: true })
  image_url?: string;

  @Column('enum', { enum: MedalTier })
  tier: MedalTier;

  @Column('text', { nullable: true })
  note?: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  // relations => 0

  // reflects
  @OneToMany(() => ChallengesMedal, (challengesMedal) => challengesMedal.medal)
  challenges_medals: ChallengesMedal[];

  @OneToMany(() => MedalsUser, (medalsUser) => medalsUser.medal)
  medals_users: MedalsUser[];

  @OneToMany(() => Post, (post) => post.attach_medal)
  posts: Post[];
}
