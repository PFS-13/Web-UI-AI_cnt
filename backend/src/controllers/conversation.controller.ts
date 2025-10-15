// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, Patch,Param,UseGuards, Query, HttpCode, Delete } from '@nestjs/common';
import { ConversationService } from '../services/conversation.service';
import { Conversation } from '../entity/conversation.entity';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { createConversationDto,getConversationByUserId} from 'src/dtos/conversation.dto';
import { UUID } from 'crypto';
@ApiTags('Conversation')
@Controller('conversation')
export class ConversationController {
  constructor(
    private conversationService: ConversationService,
  ) {}
    @ApiOperation({ summary: 'Get Conversations by User ID' })
    @Get('v1/users/:user_id')
    async getConversationByUserId(@Param('user_id') user_id: UUID) {
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
    async shareConversation(@Param('conversation_id') conversation_id: UUID, @Body('path')  path: string) {
      return await this.conversationService.share(conversation_id, path);
    }

    @ApiOperation({ summary: 'Get shared url for conversation' })
    @Get('v1/conversations/:shared_url/get-share-url')
    async getSharedConversation(@Param('shared_url') shared_url: UUID) {
      return await this.conversationService.getShared(shared_url);
    }

    @ApiOperation({ summary: 'Edit title of Conversation' })
    @Patch('v1/conversations/:conversation_id/edit')
    async edit(@Param('conversation_id') conversation_id: UUID, title:string ) {
      return await this.conversationService.edit(conversation_id,title);
    }

    @ApiOperation({ summary: 'Delete a Conversation by ID' })
    @Delete('v1/conversations/:conversation_id/delete')
    async deleteConversation(@Param('conversation_id') conversation_id: UUID){
      return await this.conversationService.delete(conversation_id);
    }


}