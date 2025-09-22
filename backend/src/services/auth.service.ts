// src/auth/auth.service.ts
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './user.service';
import { DataSource } from 'typeorm';
import { User, AuthProvider } from '../entity/user.entity';
import { Token, TokenType} from '../entity/token.entity';
import { TokenService } from './token.service';

import { AuthDto,VerifyOtpDto} from '../dtos/auth.dto';
import { createTransport, Transporter } from 'nodemailer';
import * as bcrypt from 'bcrypt';
import {UUID,randomInt}  from 'crypto';


@Injectable()
export class AuthService {
    private transporter: Transporter;
    
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private tokenService: TokenService,
    private readonly dataSource: DataSource

  ) {
    this.transporter = createTransport({
      service: 'gmail', // or your preferred email service
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        secure: false,
        tls: {
          rejectUnauthorized: false
        }
      })
  }

   async handleGoogleLogin(userData: { username: string; email: string; image_url: string }) {
    let user = await this.usersService.findByEmail(userData.email);

    if (!user) {
      user = await this.usersService.create({
        username: userData.username,
        email: userData.email,
        image_url: userData.image_url,
      });
    }

    if (!user) {
      throw new UnauthorizedException('Failed to create or retrieve user.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.username,
      image_url: user.image_url || null,
    };

    const token = this.jwtService.sign(payload);
    return { token, user };
  }

  async checkEmail(email: string) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
        return existingUser.provider
    } else {
        return null
    }
  }

async hashPassword(password: string): Promise<string> {
  const saltRounds = 5;
  return await bcrypt.hash(password, saltRounds);
}

 
async createUser({ email, password }: AuthDto): Promise<User> {
  return await this.dataSource.transaction(async (manager) => {
    //! Cek user sudah ada
    const existing_user = await manager.findOne(User, { where: { email } });
    if (existing_user) {
      throw new ConflictException('Email already in use');
    }
    //! Hash password
    const hashed_password = await this.hashPassword(password);
    //! Simpan user baru
    const new_user = manager.create(User, {
      email,
      password: hashed_password,
      provider: AuthProvider.MANUAL,
    });
    return await manager.save(new_user);
  });
}

async sendEmailVerification(id:UUID, email:string): Promise<void> {
      //! Generate OTP
    return await this.dataSource.transaction(async (manager) => {
    const code = randomInt(0, 1000000).toString().padStart(6, '0');
    const hashed_code = await this.hashPassword(code);
    //! Simpan token ke DB
    const token = manager.create(Token, {
      user_id: id,
      code: hashed_code,
      token_type: TokenType.AUTH
    });
    await manager.save(token);
    try {
      await this.sendEmail(email, code);
    } catch (err) {
      throw new Error('Failed to send verification email');
    }
    });
  }

  async register({ email, password }: AuthDto): Promise<{user_id: string }> {
    const new_user = await this.createUser({ email, password });
    await this.sendEmailVerification(new_user.id, new_user.email);
    return {
      user_id: new_user.id,
    };
  }

   async verifyOtp({ email, code }: VerifyOtpDto): Promise<{message : string}> {
    return this.dataSource.transaction(async (manager) => {
      const user = await this.usersService.findByEmail(email, manager);
      if (!user) {
        throw new NotFoundException('Email Not found');
      }
      await this.tokenService.verifyCode(user.id, code, manager);
      await this.usersService.activate(user.id, manager);
      await this.tokenService.delete(user.id, manager);
      return {message : 'User verified successfully'};
    });
  }

  async validateUser(loginDto: AuthDto): Promise<any> {
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (user.provider === AuthProvider.GOOGLE) {
      // Minta password akun Google
      throw new UnauthorizedException('Please use Google to sign in');
    }
    // Hapus password dari hasil return
    const { password, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async sendEmail(email: string, code: string): Promise<void> {
    const htmlContent = this.generateVerificationCodeEmailHTML(code);
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
          subject: `Email Verification`,
          html: htmlContent,
        });
      } catch (error) {
        throw new Error(`Failed to send email to ${email}`);
      }
  }

  async resendEmail(email: string) {
    return await this.dataSource.transaction(async (manager) => {
    const user = await this.usersService.findByEmail(email, manager)
    if (!user){
      throw new NotFoundException("Email not found")
    }
    const token = await this.tokenService.findTokenVerificationByUserId(user.id,manager)
    if (!token){
      this.sendEmailVerification(user.id, user.email)
    } else {
      this.tokenService.delete(user.id,manager)
      this.sendEmailVerification(user.id,user.email)
    }
  });
  }

  private generateVerificationCodeEmailHTML(code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Email Verification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .card { background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .title { font-size: 22px; font-weight: bold; color: #1f2937; margin-bottom: 10px; text-align: center; }
        .subtitle { font-size: 16px; color: #6b7280; margin-bottom: 20px; text-align: center; }
        .code-box { font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb; background: #f3f4f6; padding: 15px 20px; border-radius: 8px; text-align: center; }
        .footer { margin-top: 30px; font-size: 14px; color: #6b7280; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="title">🔐 Email Verification</div>
          <div class="subtitle">Use the following code to verify your email address:</div>
          
          <div class="code-box">${code}</div>
          
          <div class="footer">
            <p>If you did not request this code, please ignore this email.</p>
            <p>Thank you for using our service 🚀</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}


}