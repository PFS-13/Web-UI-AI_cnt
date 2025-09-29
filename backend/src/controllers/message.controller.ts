// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, Patch,Param,UseGuards, Query, HttpCode } from '@nestjs/common';
import { MessageService } from '../services/message.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { createMessageDto,  editMessageDto } from 'src/dtos/message.dto';
import { UUID } from 'crypto';
@ApiTags('Message')
@Controller('message')
export class MessageController {
  constructor(
    private messageService: MessageService,
  ) {}
    @ApiOperation({ summary: 'Get Messages by Conversation ID' })
    @Get('v1/conversations/:conversation_id')
    async getMessageByConversationId(@Param('conversation_id') conversation_id: UUID) {
        return await this.messageService.findByConversationId(conversation_id);
    }
    
    @ApiOperation({ summary: 'Create a message' })
    @ApiBody({type: createMessageDto})
    @Post('v1/messages/create')
    async createConversation(@Body() messageDto: createMessageDto) {
      return await this.messageService.ask(messageDto);
    }

    

}