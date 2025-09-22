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

  async findTokenVerificationByUserId(user_id: string, manager: EntityManager): Promise<Token | null> {
    return manager.getRepository(Token).findOne({ where: { user_id, token_type:TokenType.AUTH} });
  }
  async verifyCode(user_id: string, otp: string, manager?:EntityManager): Promise<boolean> {
    const repo = manager ? manager.getRepository(Token) : this.tokensRepository;
    const token = await repo.findOne({
      where: { user_id },
    });

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    // cek apakah sudah expired
    if (token.expired_date < new Date()) {
      await this.tokensRepository.delete({ user_id });
      throw new UnauthorizedException('Token expired');
    }
    
    // cocokan OTP dengan hash di database
    const isMatch = await bcrypt.compare(String(otp), String(token.code));
    if (!isMatch) {
      throw new UnauthorizedException('Invalid OTP');
    }
    return true;
  }

  async delete(user_id: string, manager:EntityManager): Promise<void> {
    await manager.getRepository(Token).delete({ user_id });
  }
}
