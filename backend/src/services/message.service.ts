// src/message/message.service.ts
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { createMessageDto } from '../dtos/message.dto';
import { Message } from '../entity/message.entity';
import { ConversationService } from './conversation.service';
// Gemini SDK
import { GoogleGenAI } from '@google/genai';
import { UUID } from 'crypto';
@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);
  private readonly modelName = 'gemini-2.5-flash';
  private aiClient: GoogleGenAI;

  constructor(
    @InjectRepository(Message)

    private readonly messageRepo: Repository<Message>,
    private readonly conversationService: ConversationService,
  ) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fail fast: jangan pakai hard-coded fallback secret
      this.logger.error('GEMINI_API_KEY is not set. Aborting AI client init.');
      throw new InternalServerErrorException('AI provider not configured');
    }
    this.aiClient = new GoogleGenAI({ apiKey });
  }

  // --- helper retry wrapper (simple exponential backoff)
  private async _withRetries<T>(fn: () => Promise<T>, attempts = 3, baseDelayMs = 300) : Promise<T> {
    let lastErr: any = null;
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (e) {
        lastErr = e;
        const delay = baseDelayMs * Math.pow(2, i);
        this.logger.warn(`Attempt ${i + 1} failed: ${e?.message ?? e}. Retrying after ${delay}ms.`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
    throw lastErr;
  }

  // Robust call model adapter
  private async _callModelRaw(prompt: string, temp = 0.25, maxTokens = 512): Promise<string> {
    if (!this.aiClient) throw new Error('AI client not initialized');
    try {
      const call = async () => {
        const resp = await this.aiClient.models.generateContent({
          model: this.modelName,
          // keep prompt as contents but if SDK requires array -> adapt here
          contents: prompt,
          config: { temperature: temp, maxOutputTokens: maxTokens },
        });

        // Log only metadata; DO NOT log full text (avoid leaking PII)
        try {
          const meta = {
            model: this.modelName,
            // if resp has status / usage fields, include them
            candidateCount: (resp as any)?.candidates?.length ?? ((resp as any)?.candidateCount ?? null),
          };
          this.logger.debug(`Gemini response meta: ${JSON.stringify(meta)}`);
        } catch (e) {
          // ignore logging error
        }

        // extract text robustly
        let assistantText = '';
        if (typeof (resp as any).text === 'string') assistantText = (resp as any).text;
        else assistantText = this._extractTextFromResp(resp);
        return assistantText ?? '';
      };

      // use retries for transient errors
      return await this._withRetries(call, 3, 400);
    } catch (e: any) {
      this.logger.error('Gemini call failed inside _callModelRaw: ' + (e?.message ?? e));
      throw e;
    }
  }

  // --- method baru: ekstrak konteks & log ke logger (sanitized)
  private async extractContextAndConsoleLog(message: Message) {
  const prompt = `
  You are an assistant that generates a suitable conversation title in Indonesian based on the user's chat message.
  Output MUST be valid JSON and ONLY JSON (no extra commentary).
  Schema:
  {
    "title": "<judul percakapan singkat, ringkas, alami, dan relevan dengan isi pesan, maksimal 10 kata>"
  }
  User message:
  """${message.content}"""
  Please produce ONLY the JSON output.
  `;

  let contextJson: any = null;

  try {
    const raw = await this._callModelRaw(prompt, 0.0, 200);
    const jsonText = this._extractJsonFromText(raw);
    contextJson = JSON.parse(jsonText);

    // 🔹 Tambahkan fallback jika tidak ada "title"
    if (!contextJson.title || contextJson.title.trim() === '') {
      contextJson.title = this._shortSummary(message.content) || 'new chat';
    }
  } catch (e) {
    this.logger.warn('Failed to extract structured context via model, using local fallback: ' + (e?.message ?? e));
    contextJson = {
      title: this._shortSummary(message.content) || 'new chat',
    };
  }

  // 🔹 Pastikan tetap ada fallback terakhir
  if (!contextJson.title || contextJson.title.trim() === '') {
    contextJson.title = 'new chat';
  }

  try {
    await this.conversationService.edit(message.conversation_id, contextJson.title);
  } catch (e) {
    this.logger.error('Failed to change conversation title ' + (e?.message ?? e));
  }

  return contextJson;
}

  // Ganti method ask di MessageService
  async ask(dto: createMessageDto) {
    const userMsg = this.messageRepo.create(dto);
    await this.messageRepo.save(userMsg);

    if (dto.parent_message_id == null) {
      this.logger.debug('No parent_message_id, extracting context for message id=' + userMsg.id);
      try {
        await this.extractContextAndConsoleLog(userMsg);
      } catch (e) {
        this.logger.error('Failed during context extraction/logging: ' + (e?.message ?? e));
      }
    } 

    this.conversationService.updatedTimestamp(dto.conversation_id).catch(e => {
      this.logger.error('Failed to update conversation timestamp: ' + (e?.message ?? e));
    });

    // ambil history (recent) - ambil fields yang dibutuhkan saja
    const recent = await this.messageRepo.find({
      where: { conversation_id: dto.conversation_id },
      order: { created_at: 'DESC' },
      take: 100,
      select: ['id', 'content', 'is_user', 'created_at'],
    });
    const historyEntitiesAll = recent.reverse();

    const historyEntities = historyEntitiesAll.filter(h => {
      if (!h.content) return false; 
      const low = h.content.trim().toLowerCase();
      if (low.startsWith('(fallback') || low.includes('(fallback gemini)')) return false;
      return true;
    });

    const lastContext = historyEntities.slice(-10).map(h => ({
      role: h.is_user ? 'user' : 'assistant',
      text: h.content,
      created_at: h.created_at,
    }));

    const systemInstruction = `Kamu adalah asisten yang membantu. Jawab singkat dan jelas dalam bahasa Indonesia kecuali diminta lain.
Penting: Fokus pada PESAN BARU di bagian akhir. Jangan menyalin jawaban assistant sebelumnya. Gunakan pesan sebelumnya hanya sebagai konteks.`;

    const contextParts = lastContext
      .map(item => `${item.role === 'user' ? 'User' : 'Assistant'}: ${item.text}`)
      .join('\n');

    const promptBase = `${systemInstruction}\n\nContext (recent):\n${contextParts}\n\n=== PESAN BARU ===\n${dto.content}\n\nAssistant:`;

    this.logger.debug(`Prompt length=${promptBase.length} for conversation=${dto.conversation_id}`);

    const callModel = async (prompt: string, temp = 0.25) => {
      return await this._callModelRaw(prompt, temp, 512);
    };

    let assistantText = '';
    try {
      assistantText = await callModel(promptBase, 0.2);
      if (!assistantText || assistantText.trim().length === 0) {
        this.logger.warn('Empty response from Gemini on first try, retrying with higher temp');
        assistantText = await callModel(promptBase, 0.6);
      }
    } catch (e) {
      this.logger.error('Model failed to produce a reply: ' + (e?.message ?? e));
      assistantText = '(Maaf, terjadi kesalahan saat mengambil jawaban. Coba ulangi permintaan Anda.)';
    }

    const lastAssistant = historyEntities.slice().reverse().find(h => !h.is_user);
    if (lastAssistant && lastAssistant.content) {
      const sim = this._similarityJaccard(lastAssistant.content, assistantText);
      this.logger.debug(`Similarity with last assistant reply = ${sim}`);
      const SIMILARITY_THRESHOLD = 0.75;
      if (sim >= SIMILARITY_THRESHOLD) {
        this.logger.log('Answer too similar to previous assistant reply — regenerating with stronger instruction');
        const promptRetry = `${systemInstruction}\n\nContext (recent):\n${contextParts}\n\n=== PESAN BARU ===\n${dto.content}\n\nAssistant: Berikan jawaban yang berbeda dari respons assistant sebelumnya. Tambahkan contoh atau langkah konkret. Singkat.`;
        try {
          const retryText = await callModel(promptRetry, 0.7);
          if (retryText && retryText.trim().length > 0) {
            const simRetry = this._similarityJaccard(lastAssistant.content, retryText);
            this.logger.debug(`Similarity after retry = ${simRetry}`);
            if (simRetry < sim) assistantText = retryText;
          }
        } catch (e) {
          this.logger.warn('Retry generation failed: ' + (e?.message ?? e));
        }
      }
    }

    if (!assistantText || assistantText.trim().length === 0) {
      assistantText = '(Maaf, terjadi kesalahan saat mengambil jawaban. Coba ulangi permintaan Anda.)';
    }

    const assistantMsg = this.messageRepo.create({
      conversation_id: dto.conversation_id,
      content: assistantText,
      is_user: false,
      is_attach_file: false,
      parent_message_id: userMsg.id
    });
    await this.messageRepo.save(assistantMsg);

    return {
      reply: { message_id: assistantMsg.id, message: assistantText },
    };
  }

  private _similarityJaccard(a: string, b: string): number {
    if (!a || !b) return 0;
    const norm = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
    const A = new Set(norm(a));
    const B = new Set(norm(b));
    if (A.size === 0 || B.size === 0) return 0;
    let inter = 0;
    for (const x of A) if (B.has(x)) inter++;
    const uni = new Set([...A, ...B]).size;
    return uni === 0 ? 0 : inter / uni;
  }

  private _extractTextFromResp(resp: any): string {
    try {
      const cand = resp?.candidates?.[0];
      const partText = cand?.content?.parts?.[0]?.text;
      if (partText) return partText;
      if (resp?.candidates?.length) return resp.candidates.map((c: any) => c?.content?.parts?.map((p: any) => p?.text ?? '').join('')).join('\n');
      return resp?.text ?? '';
    } catch (e) {
      return resp?.text ?? '';
    }
  }

  // Robust extraction of JSON inside text:
  private _extractJsonFromText(text: string): string {
    if (!text) throw new Error('Empty text');
    // 1) try to find code fence JSON ```json { ... } ```
    const fenceMatch = text.match(/```(?:json)?\s*({[\s\S]*})\s*```/i);
    if (fenceMatch && fenceMatch[1]) return fenceMatch[1];

    // 2) try to find first { ... } pair (naive but improved)
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error('JSON not found in model response');
    }
    const candidate = text.slice(firstBrace, lastBrace + 1);
    // quick sanity check
    try {
      JSON.parse(candidate);
      return candidate;
    } catch (e) {
      throw new Error('Found candidate JSON but failed to parse');
    }
  }

  private _shortSummary(text: string) {
    const trimmed = text.trim();
    if (trimmed.length <= 120) return trimmed;
    return trimmed.slice(0, 117).trim() + '...';
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

}
