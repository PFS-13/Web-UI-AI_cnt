// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './user.service';
import { TokenService } from './token.service';

import { AuthDto } from '../dtos/login.dto';
import { AuthProvider } from '../entity/user.entity';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';


@Injectable()
export class AuthService {
    private transporter: nodemailer.Transporter;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private tokenService: TokenService,
  ) {
    this.transporter = nodemailer.createTransport({
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

  async checkEmail(email: string) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('Email already in use');
    }
    return true;
  }

  async hashPassword(password: string): Promise<string> {
  const saltRounds = 5;
  return await bcrypt.hash(password, saltRounds);
}

  async register({email, password}: AuthDto) {
    //! Membuat user baru
    const existing_user = await this.usersService.findByEmail(email);
    if (existing_user) {
      throw new UnauthorizedException('Email already in use');
    }
    const hashed_password = await this.hashPassword(password);
    const new_user = await this.usersService.create({email, password: hashed_password, provider:AuthProvider.MANUAL});
    
    //! Mengirim token verifikasi email
    const code = crypto.randomInt(100000, 1000000).toString();
    console.log(`Generated OTP code for ${email}: ${code}|`);
    const hashed_code = await this.hashPassword(code);
    console.log(`Hashed OTP code ${hashed_code}`);
    await this.tokenService.create({user_Id: new_user.id, code: hashed_code});
    await this.sendEmail(email, code);
    return true;
  }

  async verifyOtp(otp:string, email:string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const is_valid = await this.tokenService.verify(user.id, otp);
    if (!is_valid) {
      throw new UnauthorizedException('Invalid OTP');
    } 

    await this.usersService.activate(user.id);
    //! Hapus token setelah verifikasi berhasil
    await this.tokenService.delete(user.id);
    return true;
  }

  


  async validateUser(loginDto: AuthDto): Promise<any> {
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Jika user mendaftar via Google dan login manual
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
        console.error(`❌ Failed to send email to ${email}:`, error);
        throw new Error(`Failed to send email to ${email}`);
      }
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