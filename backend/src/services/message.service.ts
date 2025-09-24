// src/message/message.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { createMessageDto } from '../dtos/message.dto';
import { Message } from '../entity/message.entity';

// Gemini SDK
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);
  private readonly modelName = 'gemini-2.5-flash'; // contoh; sesuaikan menurut kuota/model
  private aiClient: GoogleGenAI | null = null;
  private readonly ALLOW_FALLBACK_DUMMY = false; // jika API gagal, fallback ke dummy

  /*
{
  "conversation_id": "7210c963-5b32-4bdc-8351-c9ed9f013cfc",
  "content": "Kasih tahu aku tentang indonesia",
  "is_from_sender": true,
  "is_attach_file": false
}
  */
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {
      const apiKey = "AIzaSyCn98USB5onkAIRDiGIDPVjXI9GPmjAh_I";
      this.aiClient = new GoogleGenAI({ apiKey });
      this.logger.log('Gemini client initialized with API key');
  }

  // Ganti method ask di MessageService dengan kode ini
async ask(dto: createMessageDto) {
  const userMsg = this.messageRepo.create(dto);
  await this.messageRepo.save(userMsg);

  // ambil history (recent) tapi EXCLUDE message yang nampak seperti fallback
  const recent = await this.messageRepo.find({
    where: { conversation_id: dto.conversation_id },
    order: { created_at: 'DESC' },
    take: 100,
  });
  // urut kronologis
  const historyEntitiesAll = recent.reverse();

  // Filter: jangan masukkan assistant messages yang jelas fallback atau tag tertentu
  const historyEntities = historyEntitiesAll.filter(h => {
    if (!h.content) return false;
    const low = h.content.trim().toLowerCase();
    if (low.startsWith('(fallback') || low.includes('(fallback gemini)')) return false;
    // tambahkan pengecualian lain sesuai kebutuhan, misal is_fallback kolom
    return true;
  });

  // Susun konteks — tapi berikan penekanan pada pesan TERBARU (marker)
  const lastContext = historyEntities.slice(-10).map(h => ({
    role: h.is_from_sender ? 'user' : 'assistant',
    text: h.content,
    created_at: h.created_at,
  }));

  // Buat prompt yang menekankan fokus pada pesan baru
  const systemInstruction = `You are a helpful assistant. Answer concisely in Indonesian unless user asks otherwise.
Important: Focus your answer on the NEW user message at the end. Do not repeat or copy previous assistant responses verbatim. Use prior messages only for context.`;

  // Build a readable context block but keep it concise
  const contextParts = lastContext
    .map(item => `${item.role === 'user' ? 'User' : 'Assistant'}: ${item.text}`)
    .join('\n');

  const promptBase = `${systemInstruction}\n\nContext (recent):\n${contextParts}\n\n=== NEW USER MESSAGE ===\n${dto.content}\n\nAssistant:`;

  this.logger.debug(`Prompt length=${promptBase.length} for conversation=${dto.conversation_id}`);

  // helper: function in-file for calling the model (so we can retry easily)
  const callModel = async (prompt: string, temp = 0.25) => {
    if (!this.aiClient) throw new Error('AI client not initialized');
    try {
      const resp = await this.aiClient.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: { temperature: temp, maxOutputTokens: 512 },
      });
      this.logger.debug('Raw Gemini response: ' + JSON.stringify(resp));
      // parsing robust
      let assistantText = '';
      if (resp) {
        if (typeof (resp as any).text === 'string') assistantText = (resp as any).text;
        else assistantText = this._extractTextFromResp(resp);
      }
      return assistantText ?? '';
    } catch (e: any) {
      this.logger.error('Gemini call failed inside callModel: ' + (e?.message ?? e));
      throw e;
    }
  };

  // First attempt (low temp for deterministic answer)
  let assistantText = await callModel(promptBase, 0.2);

  // Safety: if empty, throw to catch and let caller handle (or optionally fallback)
  if (!assistantText || assistantText.trim().length === 0) {
    this.logger.warn('Empty response from Gemini on first try');
    // throw new Error('Empty response from Gemini'); // pilihan: throw atau fallback
    // as immediate mitigation, attempt one regen with slightly higher temp
    assistantText = await callModel(promptBase, 0.6);
  }

  // Compare against last assistant message (if exists)
  const lastAssistant = historyEntities.slice().reverse().find(h => !h.is_from_sender);
  if (lastAssistant && lastAssistant.content) {
    const sim = this._similarityJaccard(lastAssistant.content, assistantText);
    this.logger.debug(`Similarity with last assistant reply = ${sim}`);
    // Jika terlalu mirip, lakukan 1 retry dengan instruksi eksplisit untuk avoid repetition
    const SIMILARITY_THRESHOLD = 0.75;
    if (sim >= SIMILARITY_THRESHOLD) {
      this.logger.log('Answer too similar to previous assistant reply — regenerating with stronger instruction');
      const promptRetry = `${systemInstruction}\n\nContext (recent):\n${contextParts}\n\n=== NEW USER MESSAGE ===\n${dto.content}\n\nAssistant: Do NOT repeat prior assistant answers. Provide a fresh, different answer or additional examples and concrete steps. Keep it concise.`;
      // retry with higher temperature for variation
      const retryText = await callModel(promptRetry, 0.7);
      if (retryText && retryText.trim().length > 0) {
        // if retry is meaningfully different, use it
        const simRetry = this._similarityJaccard(lastAssistant.content, retryText);
        this.logger.debug(`Similarity after retry = ${simRetry}`);
        if (simRetry < sim) {
          assistantText = retryText;
        } else {
          // fallback to first result if retry not better
          this.logger.debug('Retry did not improve uniqueness; keeping original assistantText');
        }
      }
    }
  }

  // akhir: pastikan assistantText ada
  if (!assistantText || assistantText.trim().length === 0) {
    // final safeguard - beri jawaban minimal tapi jangan simpan fallback tanpa tag
    assistantText = '(Maaf, terjadi kesalahan saat mengambil jawaban. Coba ulangi permintaan Anda.)';
  }

  // Simpan jawaban assistant (jika ingin menandai fallback, tambahkan is_fallback)
  const assistantMsg = this.messageRepo.create({
    conversation_id: dto.conversation_id,
    content: assistantText,
    is_from_sender: false,
    is_attach_file: false,
    created_at: new Date(),
  });
  await this.messageRepo.save(assistantMsg);

  return {
    reply: { analysis: null, final: assistantText },
    meta: { model: this.modelName, conversation_id: dto.conversation_id, assistantMessageId: assistantMsg.id },
  };
}

// Tambahkan helper similarity (Jaccard word-set)
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


  // Helper: jika SDK response struktur berbeda, coba ekstrak manual
  private _extractTextFromResp(resp: any): string {
    try {
      // beberapa versi SDK mengembalikan candidates/parts
      const cand = resp?.candidates?.[0];
      const partText = cand?.content?.parts?.[0]?.text;
      if (partText) return partText;
      if (resp?.candidates?.length) return resp.candidates.map((c: any) => c?.content?.parts?.map((p: any) => p.text).join('')).join('\n');
      return resp?.text ?? '';
    } catch (e) {
      return resp?.text ?? '';
    }
  }

  // Simple fallback dummy (reuse logic dari versi sebelumnya)
  // private _fallbackDummyReply(message: string, history: any[]): string {
  //   const tokens = this._extractKeywords(message);
  //   return `(Fallback Gemini) Intinya: ${this._shortSummary(message)}.\nContoh singkat: gunakan ${tokens[0] ?? 'langkah'} sebagai titik awal.`;
  // }

  // --- helper dari versi dummy sebelumnya (classify/extract/shortSummary) ---
  private _shortSummary(text: string) {
    const trimmed = text.trim();
    if (trimmed.length <= 120) return trimmed;
    return trimmed.slice(0, 117).trim() + '...';
  }
  private _extractKeywords(text: string) : string[] {
    const stop = new Set(['yang','dan','di','ke','dari','dengan','untuk','pada','adalah','itu','sebuah','sebagai','saya','kamu']);
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stop.has(w))
      .slice(0,3);
  }
}
