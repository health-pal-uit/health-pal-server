import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PremiumPackagesModule } from './premium_packages/premium_packages.module';
import { ChatSessionsModule } from './chat_sessions/chat_sessions.module';
import { ChatParticipantsModule } from './chat_participants/chat_participants.module';
import { ChatMessagesModule } from './chat_messages/chat_messages.module';
import { FitnessGoalsModule } from './fitness_goals/fitness_goals.module';
import { FitnessProfilesModule } from './fitness_profiles/fitness_profiles.module';
import { DietTypesModule } from './diet_types/diet_types.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { MealsModule } from './meals/meals.module';
import { IngreMealsModule } from './ingre_meals/ingre_meals.module';
import { DailyLogsModule } from './daily_logs/daily_logs.module';
import { DailyIngresModule } from './daily_ingres/daily_ingres.module';
import { DailyMealsModule } from './daily_meals/daily_meals.module';
import { ActivitiesModule } from './activities/activities.module';
import { ActivityRecordsModule } from './activity_records/activity_records.module';
import { ChallengesModule } from './challenges/challenges.module';
import { MedalsModule } from './medals/medals.module';
import { ChallengesMedalsModule } from './challenges_medals/challenges_medals.module';
import { ChallengesUsersModule } from './challenges_users/challenges_users.module';
import { MedalsUsersModule } from './medals_users/medals_users.module';
import { PostsModule } from './posts/posts.module';
import { PostsMediasModule } from './posts_medias/posts_medias.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DevicesModule } from './devices/devices.module';
import { FavMealsModule } from './fav_meals/fav_meals.module';
import { FavIngresModule } from './fav_ingres/fav_ingres.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../database/data-sources';
import { ConfigModule } from '@nestjs/config';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { SupabaseAdminModule } from './supabase/supabase-admin.module';
import { ContributionMealsModule } from './contribution_meals/contribution_meals.module';
import { ContributionIngresModule } from './contribution_ingres/contribution_ingres.module';
import configuration from './config/configuration';
import * as joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Load environment variables from .env file
      load: [configuration],
      validationSchema: joi.object({
        DB_DATABASE: joi.string().required(),
        DB_USERNAME: joi.string().required(),
        DB_PORT: joi.number().default(5432),
        DB_PASSWORD: joi.string().required(),
        DB_HOST: joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    UsersModule,
    PremiumPackagesModule,
    ChatSessionsModule,
    ChatParticipantsModule,
    ChatMessagesModule,
    FitnessGoalsModule,
    FitnessProfilesModule,
    DietTypesModule,
    IngredientsModule,
    MealsModule,
    IngreMealsModule,
    DailyLogsModule,
    DailyIngresModule,
    DailyMealsModule,
    ActivitiesModule,
    ActivityRecordsModule,
    ChallengesModule,
    MedalsModule,
    ChallengesMedalsModule,
    ChallengesUsersModule,
    MedalsUsersModule,
    PostsModule,
    PostsMediasModule,
    CommentsModule,
    LikesModule,
    NotificationsModule,
    DevicesModule,
    FavMealsModule,
    FavIngresModule,
    RolesModule,
    AuthModule,
    SupabaseAdminModule,
    ContributionMealsModule,
    ContributionIngresModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
