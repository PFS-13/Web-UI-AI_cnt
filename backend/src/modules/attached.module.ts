// src/attached-message/attached-message.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachedMessage } from '../entity/attached.entity';
import { AttachedMessageService } from '../services/attached.service';
import { AttachedMessageController } from '../controllers/attached.controller';
@Module({
  imports: [TypeOrmModule.forFeature([AttachedMessage])],
  providers: [AttachedMessageService],
  controllers: [AttachedMessageController],
  exports: [AttachedMessageService],
})
export class AttachedMessageModule {}
