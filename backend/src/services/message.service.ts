// src/message/message.service.ts
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AskPayload, createMessageDto } from '../dtos/message.dto';
import { Message } from '../entity/message.entity';
import { ConversationService } from './conversation.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

// Gemini SDK
import { UUID } from 'crypto';
import { UsersService } from './user.service';
@Injectable()
export class MessageService {
  private readonly CHATBOT_URL = 'https://otto.cinte.id/webhook/y-chat';

  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    private readonly conversationService: ConversationService,
    private readonly httpService: HttpService
  ) {}
  
  // --- method baru: ekstrak konteks & log ke logger (sanitized)
//   private async extractContextAndConsoleLog(message: Message) {
//   const prompt = `
//   You are an assistant that generates a suitable conversation title in Indonesian based on the user's chat message.
//   Output MUST be valid JSON and ONLY JSON (no extra commentary).
//   Schema:
//   {
//     "title": "<judul percakapan singkat, ringkas, alami, dan relevan dengan isi pesan, maksimal 10 kata>"
//   }
//   User message:
//   """${message.content}"""
//   Please produce ONLY the JSON output.
//   `;

//   let contextJson: any = null;

//   try {
//     const raw = await this._callModelRaw(prompt, 0.0, 200);
//     const jsonText = this._extractJsonFromText(raw);
//     contextJson = JSON.parse(jsonText);

//     // 🔹 Tambahkan fallback jika tidak ada "title"
//     if (!contextJson.title || contextJson.title.trim() === '') {
//       contextJson.title = this._shortSummary(message.content) || 'new chat';
//     }
//   } catch (e) {
//     this.logger.warn('Failed to extract structured context via model, using local fallback: ' + (e?.message ?? e));
//     contextJson = {
//       title: this._shortSummary(message.content) || 'new chat',
//     };
//   }

//   // 🔹 Pastikan tetap ada fallback terakhir
//   if (!contextJson.title || contextJson.title.trim() === '') {
//     contextJson.title = 'new chat';
//   }

//   try {
//     await this.conversationService.edit(message.conversation_id, contextJson.title);
//   } catch (e) {
//     this.logger.error('Failed to change conversation title ' + (e?.message ?? e));
//   }

//   return contextJson;
// }

async isConversationNew(conversation_id: UUID): Promise<{ isNew: boolean, count: number }> {
  const count = await this.messageRepo.count({ where: { conversation_id } });
  return { isNew: count === 0 , count};
}



async ask(payload: AskPayload) {
  const { file, ...dto } = payload;
  const { isNew, count } = await this.isConversationNew(dto.conversation_id);
  try {
      const payload: any = {
        sessionId: dto.conversation_id,
        userId: "85d0c984-df35-474c-9207-85d363b42500",
        action: 'sendMessage',
        chatInput: dto.content,
      };

      console.log('Payload to chatbot:', payload);

      const response = await firstValueFrom(
        this.httpService.post(this.CHATBOT_URL, payload, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      
      console.log('🟢 Chatbot raw response:', response.status, response.statusText);

      console.log('Response from chatbot:', response.data);
      return response.data;

    } catch (error) {
      console.error('Error sending message to chatbot:', error.message);

    }

  // return {
  //   reply: {
  //     message_id_server: assistantMsg.id,
  //     message: assistantText,
  //     message_id_client: userMsg.id,
  //   },
  // };
}



  async findPathByConversationId(conversation_id: UUID): Promise<any[]> {
  const sql = `
    WITH RECURSIVE message_tree AS (
      SELECT 
        id,
        conversation_id,
        content,
        created_at,
        is_attach_file,
        is_user,
        edited_from_message_id,
        parent_message_id,
        ARRAY[id] AS path_ids,
        ARRAY[
          jsonb_build_object(
            'id', id,
            'conversation_id', conversation_id,
            'content', content,
            'created_at', created_at,
            'is_attach_file', is_attach_file,
            'is_user', is_user,
            'edited_from_message_id', edited_from_message_id,
            'parent_message_id', parent_message_id
          )
        ] AS path_messages
      FROM message
      WHERE parent_message_id IS NULL
        AND conversation_id = $1

      UNION ALL

      SELECT 
        m.id,
        m.conversation_id,
        m.content,
        m.created_at,
        m.is_attach_file,
        m.is_user,
        m.edited_from_message_id,
        m.parent_message_id,
        mt.path_ids || m.id,
        mt.path_messages || jsonb_build_object(
          'id', m.id,
          'conversation_id', m.conversation_id,
          'content', m.content,
          'created_at', m.created_at,
          'is_attach_file', m.is_attach_file,
          'is_user', m.is_user,
          'edited_from_message_id', m.edited_from_message_id,
          'parent_message_id', m.parent_message_id
        )
      FROM message m
      JOIN message_tree mt ON m.parent_message_id = mt.id
    )
    SELECT 
      path_messages
    FROM message_tree mt
    WHERE NOT EXISTS (SELECT 1 FROM message ch WHERE ch.parent_message_id = mt.id)
    ORDER BY path_ids;
  `;
  return await this.messageRepo.manager.query(sql, [conversation_id]);

}


async findByConversationId(conversation_id: UUID): Promise<number[][]> {
  const sql = `
    WITH RECURSIVE message_tree AS (
      SELECT 
        id,
        conversation_id,
        content,
        created_at,
        is_attach_file,
        is_user,
        edited_from_message_id,
        parent_message_id,
        is_edited,
        ARRAY[id] AS path_ids
      FROM message
      WHERE parent_message_id IS NULL
        AND conversation_id = $1

      UNION ALL

      SELECT 
        m.id,
        m.conversation_id,
        m.content,
        m.created_at,
        m.is_attach_file,
        m.is_user,
        m.edited_from_message_id,
        m.parent_message_id,
        m.is_edited,
        mt.path_ids || m.id
      FROM message m
      JOIN message_tree mt ON m.parent_message_id = mt.id
    )
    SELECT 
      path_ids
    FROM message_tree mt
    WHERE NOT EXISTS (SELECT 1 FROM message ch WHERE ch.parent_message_id = mt.id)
    ORDER BY path_ids;
  `;

  const result = await this.messageRepo.manager.query(sql, [conversation_id]);

  // ubah array of object menjadi array of array
  return result.map((r: any) => r.path_ids);
}

async findByIds(messageIds: number[]) {
    return this.messageRepo.find({
      where: { id: In(messageIds) },
      order: { created_at: 'ASC' },
    });
  }

  async findEditedId(message_id: number) {
    const msg = await this.messageRepo.findOne({ select: { id: true }, where: { id: message_id } });
    if (!msg) throw new Error('Message not found');
    const id_edited = await this.messageRepo.findOne({ select: { id: true }, where: { edited_from_message_id: msg.id } });
    if (!id_edited) throw new Error('No edited message found');
    return { edited_id: id_edited.id };
  }

  async setEditedId(message_id: number) {
    const msg = await this.messageRepo.findOne({ where: { id: message_id } });
    if (!msg) throw new Error('Message not found');
    msg.is_edited = true;
    await this.messageRepo.save(msg);
    return { success: true };
  }

  async findEditedChainPath(message_id: number): Promise<number[]> {
  const sql = `
    WITH RECURSIVE edit_chain AS (
    SELECT id, edited_from_message_id, 0 AS depth
      FROM public.message
    WHERE id = $1
    UNION ALL
    SELECT m.id, m.edited_from_message_id, ec.depth + 1
    FROM message m
    JOIN edit_chain ec ON m.edited_from_message_id = ec.id
  )
  SELECT array_agg(id ORDER BY depth) AS ids
  FROM edit_chain;
  `;

  const result = await this.messageRepo.manager.query(sql, [message_id]);
  return result.length > 0 ? result[0].ids : [];
}

}
