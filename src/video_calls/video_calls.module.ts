import { Module } from '@nestjs/common';
import { VideoCallsService } from './video_calls.service';
import { VideoCallsController } from './video_calls.controller';
import { VideoCall } from './entities/video_call.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consultation } from 'src/consultations/entities/consultation.entity';
import { User } from 'src/users/entities/user.entity';
import { Expert } from 'src/experts/entities/expert.entity';
import { WalletsModule } from 'src/wallets/wallets.module';
import { TokenTransactionsModule } from 'src/token_transactions/token_transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoCall, Consultation, User, Expert]),
    WalletsModule,
    TokenTransactionsModule,
  ],
  controllers: [VideoCallsController],
  providers: [VideoCallsService],
  exports: [VideoCallsService],
})
export class VideoCallsModule {}
