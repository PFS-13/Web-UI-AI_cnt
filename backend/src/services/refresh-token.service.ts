// src/users/users.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { RefreshToken } from '../entity/refresh-tokens.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshToken: Repository<RefreshToken>,
  ) {}

  async create(Token:Partial<RefreshToken>): Promise<RefreshToken> {
    const newToken = this.refreshToken.create(Token);
    const savedToken = await this.refreshToken.save(newToken);
    return savedToken;
  }
  
  async update(Token:Partial<RefreshToken>): Promise<RefreshToken> {
    const newToken = this.refreshToken.create(Token);
    const savedToken = await this.refreshToken.save(newToken);
    return savedToken;
  }
}
