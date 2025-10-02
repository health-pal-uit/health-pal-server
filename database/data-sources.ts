import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { Activity } from 'src/activities/entities/activity.entity';
import { ActivityRecord } from 'src/activity_records/entities/activity_record.entity';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { ChallengesMedal } from 'src/challenges_medals/entities/challenges_medal.entity';
import { ChallengesUser } from 'src/challenges_users/entities/challenges_user.entity';
import { ChatMessage } from 'src/chat_messages/entities/chat_message.entity';
import { ChatParticipant } from 'src/chat_participants/entities/chat_participant.entity';
import { ChatSession } from 'src/chat_sessions/entities/chat_session.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Contribution } from 'src/contributions/entities/contribution.entity';
import { DailyIngre } from 'src/daily_ingres/entities/daily_ingre.entity';
import { DailyLog } from 'src/daily_logs/entities/daily_log.entity';
import { DailyMeal } from 'src/daily_meals/entities/daily_meal.entity';
import { Device } from 'src/devices/entities/device.entity';
import { DietType } from 'src/diet_types/entities/diet_type.entity';
import { FavIngre } from 'src/fav_ingres/entities/fav_ingre.entity';
import { FavMeal } from 'src/fav_meals/entities/fav_meal.entity';
import { FitnessGoal } from 'src/fitness_goals/entities/fitness_goal.entity';
import { FitnessProfile } from 'src/fitness_profiles/entities/fitness_profile.entity';
import { IngreMeal } from 'src/ingre_meals/entities/ingre_meal.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Meal } from 'src/meals/entities/meal.entity';
import { Medal } from 'src/medals/entities/medal.entity';
import { MedalsUser } from 'src/medals_users/entities/medals_user.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { Post } from 'src/posts/entities/post.entity';
import { PostsMedia } from 'src/posts_medias/entities/posts_media.entity';
import { PremiumPackage } from 'src/premium_packages/entities/premium_package.entity';
import { Role } from 'src/roles/entities/role.entity';
import { User } from 'src/users/entities/user.entity';
import { DataSource, DataSourceOptions } from 'typeorm';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule.forRoot()],
  inject: [ConfigService], // injecttttttttt configservice
  useFactory: async (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: +configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: [
      Activity,
      ActivityRecord,
      Challenge,
      ChallengesMedal,
      ChallengesUser,
      ChatMessage,
      ChatParticipant,
      ChatSession,
      Comment,
      DailyIngre,
      DailyLog,
      DailyMeal,
      Device,
      DietType,
      FavIngre,
      FavMeal,
      FitnessGoal,
      FitnessProfile,
      IngreMeal,
      Ingredient,
      Like,
      Meal,
      Medal,
      MedalsUser,
      Notification,
      Post,
      PostsMedia,
      PremiumPackage,
      User,
      Role,
      Contribution,
    ], // change later
    autoLoadEntities: true,
    migrations: [__dirname + '/../migrations/**/*{.ts,.js}'], // change later
    synchronize: true,
  }),
};
// for cli

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: +(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '135792468',
  database: process.env.DB_DATABASE || 'health-pal-db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
