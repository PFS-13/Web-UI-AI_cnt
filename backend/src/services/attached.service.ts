// src/attached-message/attached-message.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttachedMessage } from '../entity/attached.entity';

@Injectable()
export class AttachedMessageService {
  constructor(
    @InjectRepository(AttachedMessage)
    private repo: Repository<AttachedMessage>,
  ) {}

  async saveMetadata(filename: string, message_id: number, extension?: string) {
    const rec = this.repo.create({
      filename,
      message_id,
      extension: extension ?? undefined,
    });
    return this.repo.save(rec);
  }

  // contoh: cari by message id
  async findByMessageId(message_id: number) {
    return this.repo.find({ where: { message_id } });
  }
}
