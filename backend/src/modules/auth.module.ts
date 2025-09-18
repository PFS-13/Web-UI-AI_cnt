// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { UsersModule } from '../modules/user.module';
import { LocalStrategy } from '../auth/local.strategy';
import { JwtStrategy } from '../auth/jwt.strategy';
import { TokenService } from 'src/services/token.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Token } from 'src/entity/token.entity';
import { GoogleStrategy } from 'src/auth/google.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret',
      signOptions: { expiresIn: '60m' },
    }),
      TypeOrmModule.forFeature([Token]),

  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, TokenService, GoogleStrategy],
  controllers: [AuthController],
  exports: [AuthService, TokenService],
})
export class AuthModule {}