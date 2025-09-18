import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Exclude } from "class-transformer";
import { Expert } from "src/experts/entities/expert.entity";
import { ExpertsRating } from "src/experts_ratings/entities/experts_rating.entity";
import { Booking } from "src/bookings/entities/booking.entity";
import { ChatParticipant } from "src/chat_participants/entities/chat_participant.entity";
import { ChatMessage } from "src/chat_messages/entities/chat_message.entity";
import { FitnessGoal } from "src/fitness_goals/entities/fitness_goal.entity";
import { FitnessProfile } from "src/fitness_profiles/entities/fitness_profile.entity";
import { DailyLog } from "src/daily_logs/entities/daily_log.entity";
import { ChallengesUser } from "src/challenges_users/entities/challenges_user.entity";
import { MedalsUser } from "src/medals_users/entities/medals_user.entity";
import { Post } from "src/posts/entities/post.entity";
import { Comment } from "src/comments/entities/comment.entity";
import { Like } from "src/likes/entities/like.entity";
import { Notification } from "src/notifications/entities/notification.entity";
import { Device } from "src/devices/entities/device.entity";
import { FavIngre } from "src/fav_ingres/entities/fav_ingre.entity";
import { FavMeal } from "src/fav_meals/entities/fav_meal.entity";
import { Role } from "src/roles/entities/role.entity";
import { PremiumPackage } from "src/premium_packages/entities/premium_package.entity";

@ApiSchema({name: User.name, description: 'User entity'})
@Entity('users')
export class User {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string; // @IsUUID() in dto

    @ApiProperty()
    @Column({ type: 'varchar', length: 255, unique: true })
    username!: string; // @IsString() in dto

    @ApiProperty()   
    @Column({type: 'varchar', length: 255})
    @Exclude({ toPlainOnly: true }) // Exclude password from the response   
    hashed_password!: string; // @IsString() in dto

    @ApiProperty()
    @Column({type: 'varchar', length: 255, unique: true})
    email!: string;

    @ApiProperty()
    @Column({type: 'varchar', length: 255, nullable: true})
    phone: string;

    @ApiProperty()
    @Column({type: 'varchar', length: 255, nullable: true})
    fullname: string;

    @ApiProperty()
    @Column({type: 'boolean', default: false})
    gender: boolean;

    @ApiProperty()
    @Column({type: 'date', nullable: true})
    birth_date: Date;

    @ApiProperty({ type: String, nullable: true, description: 'Avatar URL' })
    @Column({type: 'text', nullable: true})
    avatar_url?: string;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @ApiProperty()
    @Column({ type: 'timestamptz', nullable: true })
    deactivated_at?: Date;

    // relations

    @OneToMany(() => Role , (role) => role.user)
    roles: Role[];

    @ManyToOne(() => PremiumPackage, (premiumPackage) => premiumPackage.users, { nullable: true })
    premiumPackage: PremiumPackage;

    // reflects

    @OneToOne(() => Expert, (expert) => expert.user)
    expert: Expert;

    @OneToMany(() => ExpertsRating, (rating) => rating.user)
    expert_ratings: ExpertsRating[];

    @OneToMany(() => Booking, (booking) => booking.user)
    bookings: Booking[];

    @OneToMany(() => ChatParticipant, (chat_participant) => chat_participant.user)
    chat_participants: ChatParticipant[];

    @OneToMany(() => ChatMessage, (chat_message) => chat_message.user)
    chat_messages: ChatMessage[];

    @OneToMany(() => FitnessGoal, (fg) => fg.user)
    fitness_goals: FitnessGoal[];

    @OneToOne(() => FitnessProfile, (fitness_profile) => fitness_profile.user)
    fitness_profile: FitnessProfile;

    @OneToMany(() => DailyLog, (daily_log) => daily_log.user)
    daily_logs: DailyLog[];

    @OneToMany(() => ChallengesUser, (challengesUser) => challengesUser.user)
    challenges_users: ChallengesUser[];

    @OneToMany(() => MedalsUser, (medalsUser) => medalsUser.user)
    medals_users: MedalsUser[];

    @OneToMany(() => Post, (post) => post.user)
    posts: Post[];

    @ManyToMany(() => Post, (post) => post.reported_by)
    @JoinTable({
    name: 'posts_reported_by',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'post_id', referencedColumnName: 'id' },
    })
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
    likes: Like[]

    @OneToMany(() => Notification, (notification) => notification.user)
    notifications: Notification[];

    @OneToMany(() => Device, (device) => device.user)
    devices: Device[];

    @OneToMany(() => FavIngre, (favIngre) => favIngre.user)
    fav_ingres: FavIngre[];

    @OneToMany(() => FavMeal, (favMeal) => favMeal.user)
    fav_meals: FavMeal[];

}
