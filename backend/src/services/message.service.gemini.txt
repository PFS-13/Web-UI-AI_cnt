import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createMessageDto } from '../dtos/message.dto';
import { Message } from '../entity/message.entity';

@Injectable()
export class ChatService {

  // Config
  private readonly modelName = 'dummy-gemini-v1';

  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  async ask(dto: createMessageDto) {

    // 1) simpan pesan user
    const userMsg = this.messageRepo.create({
      conversation_id: dto.conversation_id,
      content: dto.content,
      is_from_sender: true,
      is_attach_file: false,
      created_at: new Date(),
    });
    await this.messageRepo.save(userMsg);

    // 2) ambil history terakhir (mis. 20 pesan) untuk konteks
    const historyEntities = await this.messageRepo.find({
      where: { conversation_id: dto.conversation_id },
      order: { created_at: 'ASC' }, // urut kronologis
      take: 50, // ambil sebagian besar history (menurut kebutuhan)
    });

    // map history ke bentuk internal yang mudah dipakai
    const history = historyEntities.map(h => ({
      role: h.is_from_sender ? 'user' : 'assistant',
      text: h.content,
      created_at: h.created_at,
    }));

    // 3) generate analysis + final reply berdasarkan history + current message
    const analysis = this._buildAnalysis(dto.content, history);
    const final = this._buildFinalAnswer(dto.content, analysis, history);

    // 4) simpan jawaban assistant ke DB
    const assistantMsg = this.messageRepo.create({
      conversation_id: dto.conversation_id,
      content: final,
      is_from_sender: false,
      is_attach_file: false,
      created_at: new Date(),
    });
    await this.messageRepo.save(assistantMsg);

    // 5) kembalikan hasil
    return {
      reply: { analysis, final },
      meta: { model: this.modelName, conversationId: dto.conversation_id, assistantMessageId: assistantMsg.id },
    };
  }

  // ----------------------
  // Dummy internals (mirip implementasi rule-based dari sebelumnya)
  // ----------------------

  private _buildAnalysis(message: string, history: any[]) : string {
    const qtype = this._classifyQuestion(message);
    const tokens = this._extractKeywords(message);
    const reasoningParts = [];
    reasoningParts.push(`Tipe pertanyaan: ${qtype}.`);
    if (tokens.length) reasoningParts.push(`Kata kunci: ${tokens.join(', ')}.`);
    if (history && history.length) reasoningParts.push(`Riwayat percakapan: ${history.length} pesan (digunakan sebagai konteks).`);
    reasoningParts.push(this._sample([
      'Prioritaskan kejelasan dan contoh praktis.',
      'Fokus pada langkah yang mudah diikuti.',
      'Sertakan tips pencegahan bila perlu.'
    ], message));
    return reasoningParts.join(' ');
  }

  private _buildFinalAnswer(message: string, analysis: string, history: any[]): string {
    const qtype = this._classifyQuestion(message);
    const tokens = this._extractKeywords(message);

    if (qtype === 'how' || qtype === 'procedural') {
      const steps = this._generateSteps(message, tokens);
      return `Berikut langkahnya:\n${steps.join('\n')}\nJika perlu, saya bisa memberikan contoh konfigurasi atau skrip.`;
    }

    if (qtype === 'why' || qtype === 'explanatory') {
      const core = this._sample([
        `Karena ${tokens.length ? tokens[0] : 'faktor utama'} mempengaruhi hasil melalui beberapa mekanisme: ...`,
        `Intinya, ${tokens.length ? tokens[0] : 'sebab utama'} menyebabkan efek yang terlihat karena ...`
      ], message);
      return `${core}\nRingkasan: ${this._shortSummary(message)}.`;
    }

    const main = `Intinya: ${this._shortSummary(message)}.`;
    const example = tokens.length ? `Contoh terkait ${tokens[0]}: (uraian singkat).` : 'Contoh: ...';
    return `${main}\n\n${example}\n\nMau jawaban yang lebih teknis atau singkat?`;
  }

  // Helpers (sama logic seperti versi in-memory)
  private _classifyQuestion(text: string) : string {
    const t = text.toLowerCase();
    if (/^(how|bagaimana|cara|langkah|tutorial)/.test(t) || /cara|bagaimana/.test(t)) return 'how';
    if (/^(why|kenapa|mengapa)/.test(t) || /kenapa|mengapa/.test(t)) return 'why';
    if (/\b(apa|definis[ai]|apa itu)\b/.test(t)) return 'definition';
    if (/^(apakah|bolehkah|haruskah)/.test(t)) return 'yesno';
    return 'general';
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

  private _generateSteps(message: string, tokens: string[]) : string[] {
    const base = [
      `1) Persiapan: kumpulkan ${tokens[0] ?? 'alat/data'} yang diperlukan.`,
      `2) Langkah inti: lakukan langkah utama (jalankan perintah / konfigurasi).`,
      `3) Verifikasi: cek hasil dengan langkah sederhana.`,
      `4) Troubleshoot: jika gagal, periksa log & konfigurasi.`,
      `5) Optimasi: langkah lanjutan bila perlu.`
    ];
    const wanted = Math.min(5, Math.max(3, Math.floor(message.length / 60) + 2));
    return base.slice(0,wanted);
  }

  private _shortSummary(text: string) {
    const trimmed = text.trim();
    if (trimmed.length <= 120) return trimmed;
    return trimmed.slice(0, 117).trim() + '...';
  }

  private _sample(choices: string[], seedStr = '') {
    const h = this._simpleHash(seedStr);
    return choices[h % choices.length];
  }
  private _simpleHash(s: string){
    let h = 0;
    for (let i=0;i<s.length;i++){ h = (h<<5) - h + s.charCodeAt(i); h |= 0; }
    return Math.abs(h);
  }
}
