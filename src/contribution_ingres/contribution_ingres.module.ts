import { Module } from '@nestjs/common';
import { ContributionIngresService } from './contribution_ingres.service';
import { ContributionIngresController } from './contribution_ingres.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributionIngre } from './entities/contribution_ingre.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { SupabaseStorageModule } from 'src/supabase-storage/supabase-storage.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContributionIngre, Ingredient]),
    SupabaseStorageModule,
    NotificationsModule,
  ],
  controllers: [ContributionIngresController],
  providers: [ContributionIngresService],
  exports: [ContributionIngresService],
})
export class ContributionIngresModule {}
