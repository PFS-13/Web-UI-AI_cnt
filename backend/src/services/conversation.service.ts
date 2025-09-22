// src/users/users.service.ts
import { Injectable,NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../entity/conversation.entity'; // Adjust the import path as necessary
import { createConversationDto, getConversationByUserId } from 'src/dtos/conversation.dto';
import { UsersService } from './user.service';
import { DataSource } from 'typeorm'; 
import { randomUUID, UUID } from 'crypto';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
    private usersService: UsersService,
    private readonly dataSource: DataSource
  ) {}

  async findByUserId(user_id: UUID): Promise<Conversation | null> {
    const user = await this.usersService.findById(user_id);
    if (!user) {
      throw new Error('User not found');
    }
    return await this.conversationsRepository.findOne({ where: { user_id } });
  }

  async findAllByUserId({user_id}: getConversationByUserId): Promise<Conversation[]> {
    
    return await this.conversationsRepository.find({ where: { user_id } });
  }

  async create(conversation: createConversationDto,): Promise<{ message: string; data?: Conversation }> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const repo = manager.getRepository(Conversation);
        const user = await this.usersService.findById(conversation.user_id);
        if (!user) {
          throw new Error('User not found');
        }
        const newConversation = repo.create(conversation);
        const savedConversation = await repo.save(newConversation);
        return {
          message: 'Conversation created successfully',
          data: savedConversation,
        };
      });
    } catch (error) {
      return {
        message: `Failed to create conversation: ${error.message}`,
      };
    }
  }
  
  async share(conversation_id: UUID): Promise<{ message: string; shared_url?: string }> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const repo = manager.getRepository(Conversation);
        const existingConversation = await repo.findOne({ where: { conversation_id } });
        if (!existingConversation) {
          throw new NotFoundException('Conversation not found');
        }
        const shared_url = randomUUID();
        existingConversation.shared_url = shared_url;
        await repo.save(existingConversation);
        return {
          message: 'Conversation shared successfully',
          data: shared_url,
        };
      });
    } catch (error) {
      return {
        message: `Failed to share conversation: ${error.message}`,
      };
    }
  }
  async edit(conversation_id : UUID, title : string): Promise<{ message: string; }> {
    try {
      return await this.dataSource.transaction(async (manager) => {     
      const repo = manager.getRepository(Conversation);
      const existingConversation = await repo.findOne({ where: { conversation_id } });
      if (!existingConversation) {
        throw new NotFoundException('Conversation not found');
      }
      await repo.update(conversation_id, { title });
      return {
        message: 'Conversation updated successfully',
      };
    });
  } catch (error) {
    return {
      message: `Failed to update conversation: ${error.message}`,
    };
  }
}

  async delete(conversation_id: UUID): Promise<{ message: string }> {
  try {
    return await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Conversation);

      const existing = await repo.findOne({ where: { conversation_id } });
      if (!existing) {
        throw new Error('Conversation not found');
      }
      await repo.delete({ conversation_id });

      return { message: 'Conversation deleted successfully' };
    });
  } catch (error) {
    return { message: `Failed to delete conversation: ${error.message}` };
  }
}
}
