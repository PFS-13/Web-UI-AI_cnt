// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, Patch,Param,UseGuards, Query, HttpCode, Delete } from '@nestjs/common';
import { ConversationService } from '../services/conversation.service';
import { Conversation } from '../entity/conversation.entity';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { createConversationDto,editConversationDto,getConversationByUserId} from 'src/dtos/conversation.dto';
import { UUID } from 'crypto';
@ApiTags('Conversation')
@Controller('conversation')
export class ConversationController {
  constructor(
    private conversationService: ConversationService,
  ) {}
    @ApiOperation({ summary: 'Get Conversations by User ID' })
    @Get('v1/conversations/user/:user_id')
    async getConversationByUserId(@Param('user_id') user_id: getConversationByUserId) {
      return await this.conversationService.findAllByUserId(user_id);
    }

    @ApiOperation({ summary: 'Create a new Conversation' })
    @ApiBody({type: createConversationDto})
    @HttpCode(200)
    @Post('v1/create')
    async createConversation(@Body() conversation: createConversationDto) {
      return await this.conversationService.create(conversation);
  }

    @ApiOperation({ summary: 'Create shared url for conversation' })
    @HttpCode(200)
    @Patch('v1/conversations/:conversation_id/create-share-url')
    async shareConverasation(@Param('conversation_id') conversation_id: UUID) {
      return await this.conversationService.share(conversation_id);
    }

    @ApiOperation({ summary: 'Edit title of Conversation' })
    @ApiBody({type: editConversationDto})
    @Patch('v1/conversations/edit')
    async edit(@Body() conversation: editConversationDto) {
      return await this.conversationService.edit(conversation);
    }

    @ApiOperation({ summary: 'Delete a Conversation by ID' })
    @Delete('v1/conversations/:conversation_id/delete')
    async deleteConversation(@Param('conversation_id') conversation_id: UUID){
      return await this.conversationService.delete(conversation_id);
    }


}