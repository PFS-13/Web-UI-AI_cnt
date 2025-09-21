import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '../entity/message.entity';
import { MessageService } from '../services/message.service';
import { MessageController } from '../controllers/message.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
  ],
  providers: [MessageService],
  controllers: [MessageController],
  exports: [],
})
export class MessageModule {}