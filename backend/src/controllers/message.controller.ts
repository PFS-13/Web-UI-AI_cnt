// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, Patch,Param,UseInterceptors, Query, HttpCode, BadRequestException, UploadedFile } from '@nestjs/common';
import { MessageService } from '../services/message.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AskPayload, createMessageDto,  editMessageDto } from 'src/dtos/message.dto';
import { UUID } from 'crypto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileFilterCallback } from 'multer';
const MULTER_OPTIONS = {
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB limit (adjust)
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowed = ['image/png','image/jpeg','image/webp','image/gif','video/mp4','application/pdf','text/plain'];
    if (!allowed.includes(file.mimetype)) {
      cb(new BadRequestException('Tipe file tidak didukung'));
      return;
    }
    cb(null, true);
  }
};

@ApiTags('Message')
@Controller('message')
export class MessageController {
  constructor(
    private messageService: MessageService,
  ) {}

  @ApiOperation({ summary: 'Get Path Messages by Conversation ID' })
    @Get('v1/conversations/:conversation_id/paths')
    async getMessagePathByConversationId(@Param('conversation_id') conversation_id: UUID) {
        return await this.messageService.findPathByConversationId(conversation_id);
    }
    @ApiOperation({ summary: 'Get Messages by Conversation ID' })
    @Get('v1/conversations/:conversation_id')
    async getMessageByConversationId(@Param('conversation_id') conversation_id: UUID) {
        return await this.messageService.findByConversationId(conversation_id);
    }
    
    @ApiOperation({ summary: 'Create a message' })
    @ApiBody({type: createMessageDto})
    @Post('v1/messages/create')
    @UseInterceptors(FileInterceptor('file', MULTER_OPTIONS))
    async createConversation(
      @Body() messageDto: createMessageDto,
      @UploadedFile() file?: Express.Multer.File,) {
      const payload: AskPayload = { ...messageDto, file };
      return await this.messageService.ask(payload);
    }



    @ApiOperation({ summary: 'Get a message by Ids' })
    @ApiBody({type: createMessageDto})
    @Post('v1/messages/get-by-ids')
    async getMessage(@Body('message_ids') message_ids: number[]) {
      return await this.messageService.findByIds(message_ids);
    }

    @ApiOperation({ summary: 'Get edited id_message' })
    @ApiBody({type: createMessageDto})
    @Get('v1/messages/:message_id/edited-id')
    async getEditedMessage(@Param('message_id') message_id: number) {
      return await this.messageService.findEditedId(message_id);
    }

    @ApiOperation({ summary: 'Set message is edited' })
    @ApiBody({type: createMessageDto})
    @Patch('v1/messages/:message_id/is-edited')
    async setEditedMessage(@Param('message_id') message_id: number) {
      return await this.messageService.setEditedId(message_id);
    }

    @ApiOperation({ summary: 'Set message is edited' })
    @ApiBody({type: createMessageDto})
    @Get('v1/messages/:message_id/chained-message')
    async getChainedMessage(@Param('message_id') message_id: number) {
      return await this.messageService.findEditedChainPath(message_id);
    }

    

  }