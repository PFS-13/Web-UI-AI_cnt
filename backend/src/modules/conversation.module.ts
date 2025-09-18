import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from '../entity/conversation.entity';
import { ConversationService } from '../services/conversation.service';
import { ConversationController } from '../controllers/conversation.controller';
import { UsersModule } from './user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation]),
    UsersModule,
  ],
  providers: [ConversationService],
  controllers: [ConversationController],
  exports: [ConversationService],
})
export class ConversationModule {}