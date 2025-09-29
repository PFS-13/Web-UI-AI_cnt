// src/users/users.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Token, TokenType } from '../entity/token.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private tokensRepository: Repository<Token>,
  ) {}


  async create(Token:Partial<Token>): Promise<Token> {
    const newToken = this.tokensRepository.create(Token);
    const savedToken = await this.tokensRepository.save(newToken);
    return savedToken;
  }

  async findToken(user_id: string, token_type: TokenType, manager: EntityManager): Promise<Token | null> {
    return manager.getRepository(Token).findOne({ where: { user_id, token_type } });
  }
  async verifyCodeAndDelete(user_id: string, token_type: TokenType, otp: string): Promise<boolean> {
    const token = await this.tokensRepository.findOne({
      where: { user_id, token_type },
    });
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    // cek apakah sudah expired
    if (token.expired_date < new Date()) {
      await this.tokensRepository.delete({ user_id, token_type });
      throw new UnauthorizedException('Token expired, please resend email for new OTP');
    }
    // cocokan OTP dengan hash di database
    const isMatch = await bcrypt.compare(String(otp), String(token.code));
    if (!isMatch) {
      throw new UnauthorizedException('Invalid OTP');
    }
    await this.tokensRepository.delete({ user_id, token_type });
    return true;
  }

  async delete(user_id: string, token_type: TokenType, manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(Token) : this.tokensRepository;
    await repo.delete({ user_id, token_type });
  }
}
