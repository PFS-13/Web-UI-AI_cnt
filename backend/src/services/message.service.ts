
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entity/message.entity'; // Adjust the import path as necessary

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async findByConversationId(conversation_id: string): Promise<Message[]> {
  return await this.messagesRepository.find({
    where: { conversation_id },
    relations: [
      'conversation',
      'editedFromMessage',
      'editedMessages',
      'replyFromMessage',
      'replyMessages',
    ],
    order: {
      created_at: 'ASC', // biar pesan muncul berurutan
    },
  });
}

  async create(message : Partial<Message>): Promise<Message | null> {
    const newMessage = this.messagesRepository.create(message);
    const savedMessage = await this.messagesRepository.save(newMessage);
    return savedMessage;
  }

  async edit(message_id: number, newContent: string): Promise<Message | null> {
    const message = await this.messagesRepository.findOne({ where: { id: message_id } });
    if (!message) {
      return null; 
    }
    message.content = newContent;
    const updatedMessage = await this.messagesRepository.save(message);
    return updatedMessage;
  }

  

}