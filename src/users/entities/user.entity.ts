import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ChatParticipant } from 'src/chat_participants/entities/chat_participant.entity';
import { ChatMessage } from 'src/chat_messages/entities/chat_message.entity';
import { FitnessGoal } from 'src/fitness_goals/entities/fitness_goal.entity';
import { FitnessProfile } from 'src/fitness_profiles/entities/fitness_profile.entity';
import { DailyLog } from 'src/daily_logs/entities/daily_log.entity';
import { ChallengesUser } from 'src/challenges_users/entities/challenges_user.entity';
import { MedalsUser } from 'src/medals_users/entities/medals_user.entity';
import { Post } from 'src/posts/entities/post.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { Device } from 'src/devices/entities/device.entity';
import { FavIngre } from 'src/fav_ingres/entities/fav_ingre.entity';
import { FavMeal } from 'src/fav_meals/entities/fav_meal.entity';
import { Role } from 'src/roles/entities/role.entity';
import { PremiumPackage } from 'src/premium_packages/entities/premium_package.entity';
import { ContributionIngre } from 'src/contribution_ingres/entities/contribution_ingre.entity';
import { ContributionMeal } from 'src/contribution_meals/entities/contribution_meal.entity';
import { ActivityRecord } from 'src/activity_records/entities/activity_record.entity';

@ApiSchema({ name: User.name, description: 'User entity' })
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string; // @IsUUID() in dto

  @Column({ type: 'varchar', length: 255, unique: true })
  username!: string; // @IsString() in dto

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude({ toPlainOnly: true }) // Exclude password from the response
  hashed_password!: string; // @IsString() in dto

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fullname: string;

  @Column({ type: 'boolean', default: false })
  gender: boolean;

  @Column({ type: 'date', nullable: true })
  birth_date: Date;

  // @ApiProperty({ type: String, nullable: true, description: 'Avatar URL' })
  @Column({ type: 'text', nullable: true })
  avatar_url?: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deactivated_at?: Date;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean; // email verified

  @Column({ type: 'timestamptz', nullable: true })
  google_fit_connected_at: Date | null;

  @Column({ type: 'text', nullable: true })
  google_fit_refresh_token: string | null;

  @Column({ type: 'text', nullable: true })
  google_fit_access_token: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  google_fit_token_expires_at: Date | null;

  @Column({ type: 'text', nullable: true })
  google_fit_email: string | null;

  // relations

  // @OneToMany(() => Role, (role) => role.user)
  // roles: Role[];
  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => PremiumPackage, (premiumPackage) => premiumPackage.users, { nullable: true })
  @JoinColumn({ name: 'premium_package_id' })
  premium_package: PremiumPackage; // default...

  // reflects

  @OneToMany(() => ChatParticipant, (chat_participant) => chat_participant.user)
  chat_participants: ChatParticipant[];

  @OneToMany(() => ChatMessage, (chat_message) => chat_message.user)
  chat_messages: ChatMessage[];

  @OneToMany(() => FitnessGoal, (fg) => fg.user)
  fitness_goals: FitnessGoal[];

  @OneToMany(() => FitnessProfile, (fitness_profile) => fitness_profile.user)
  fitness_profiles: FitnessProfile[];

  @OneToMany(() => DailyLog, (daily_log) => daily_log.user)
  daily_logs: DailyLog[];

  @OneToMany(() => ChallengesUser, (challengesUser) => challengesUser.user)
  challenges_users: ChallengesUser[];

  @OneToMany(() => MedalsUser, (medalsUser) => medalsUser.user)
  medals_users: MedalsUser[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @ManyToMany(() => Post, (post) => post.reported_by)
  reported_posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @ManyToMany(() => Comment, (comment) => comment.reported_by)
  @JoinTable({
    name: 'comments_reported_by',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'comment_id', referencedColumnName: 'id' },
  })
  reported_comments: Comment[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Device, (device) => device.user)
  devices: Device[];

  @OneToMany(() => FavIngre, (favIngre) => favIngre.user)
  fav_ingres: FavIngre[];

  @OneToMany(() => FavMeal, (favMeal) => favMeal.user)
  fav_meals: FavMeal[];

  @OneToMany(() => ContributionIngre, (contribution) => contribution.author)
  contributionsIngresAuthored: ContributionIngre[];

  @OneToMany(() => ContributionIngre, (contribution) => contribution.reviewer)
  contributionsIngresReviewed: ContributionIngre[];

  @OneToMany(() => ContributionMeal, (contribution) => contribution.author)
  contributionsMealsAuthored: ContributionMeal[];

  @OneToMany(() => ContributionMeal, (contribution) => contribution.reviewer)
  contributionsMealsReviewed: ContributionMeal[];
}
