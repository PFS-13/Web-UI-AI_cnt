import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '../entity/message.entity';
import { MessageService } from '../services/message.service';
import { MessageController } from '../controllers/message.controller';
import { ConversationModule } from './conversation.module';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    ConversationModule,
    HttpModule
  ],
  providers: [MessageService],
  controllers: [MessageController],
  exports: [],
})
export class MessageModule {}