// src/users/users.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '../entity/token.entity';
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
  async verify(userId: string, otp: string): Promise<boolean> {
    const token = await this.tokensRepository.findOne({
      where: { user_Id: userId },
    });

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    // cek apakah sudah expired
    if (token.expired_date < new Date()) {
      await this.tokensRepository.delete({ user_Id: userId });
      throw new UnauthorizedException('Token expired');
    }

    // cocokan OTP dengan hash di database
    const isMatch = await bcrypt.compare(String(otp), String(token.code));
    if (!isMatch) {
      throw new UnauthorizedException('Invalid OTP HAHA');
    }
    return true;
  }

  async delete(userId: string): Promise<void> {
    await this.tokensRepository.delete({ user_Id: userId });
  }
}
