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
import { log } from 'console';


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
        provider: AuthProvider.GOOGLE,
        is_active: true,
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
    console.log('Creating user with password:', password);
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

  async register({ email, password }: AuthDto): Promise<{user_id: string }> {
    const new_user = await this.createUser({ email, password });
    await this.createTokenSendEmail(new_user.id, TokenType.AUTH, new_user.email);
    return {
      user_id: new_user.id,
    };
  }
   async verifyOtp({ email, code, token_type }: VerifyOtpDto): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const user = await this.usersService.findByEmail(email, manager);
      if (!user) {
        throw new NotFoundException('Email Not found');
      }
      await this.tokenService.verifyCode(user.id, token_type, code, manager);
      await this.tokenService.delete(user.id, token_type, manager);
      if (token_type === TokenType.AUTH) {
        await this.usersService.activate(user.id, manager);
      }
    });
  }

  async validateUser(loginDto: AuthDto): Promise<any> {
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (user.provider === AuthProvider.GOOGLE) {
      throw new UnauthorizedException('Please use Google to sign in');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('User is not active. Please verify your email.');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
  
    if (!isMatch) {
      throw new UnauthorizedException('Invalid Password');
    }
    const { password, ...result } = user;
    return result;
  }

  async login(loginDto: AuthDto): Promise<any> {
    const user = await this.validateUser(loginDto);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email, sub: user.id }; 
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  async changePassword(user_id: UUID, new_password: string): Promise<void> {
  console.log('Changing password for user:', user_id, 'to new password:', new_password);
  return await this.dataSource.transaction(async (manager) => {
    const user = await manager.findOne(User, { where: { id: user_id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const hashed_password = await this.hashPassword(new_password);
    user.password = hashed_password;
    await manager.save(user);
  });
}

  async createTokenSendEmail(id:UUID, token_type: TokenType, email:string): Promise<void> {
    //! Generate OTP
    return await this.dataSource.transaction(async (manager) => {
    const code = randomInt(0, 1000000).toString().padStart(6, '0');
    const hashed_code = await this.hashPassword(code);
    //! Simpan token ke DB
    const token = manager.create(Token, {
      user_id: id,
      code: hashed_code,
      token_type: token_type,
    });
    await manager.save(token);
    try {
      await this.sendEmail(email, token_type, code);
    } catch (err) {
      throw new Error('Failed to send verification email');
    }
    });
  }
  async sendEmail(email: string, type: TokenType, code: string): Promise<void> {
    let htmlContent = '';
    let subject = '';
    if (type === TokenType.AUTH) {
      htmlContent = this.generateVerificationCodeEmailHTML(code);
      subject = 'Email Verification';
    } else if (type === TokenType.FORGOT_PASSWORD) {
      subject = 'Forgot Password';
      htmlContent = this.generateForgotPasswordOtpEmailHTML(code);
    }
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        html: htmlContent,
      });
    } catch (error) {
        throw new Error(`Failed to send email to ${email}`);
      }
  }

  async resendEmail(email: string, token_type: TokenType) {
    return await this.dataSource.transaction(async (manager) => {
      const user = await this.usersService.findByEmail(email, manager);
      if (!user) {
        throw new NotFoundException("Email not found");
      }
    const token = await this.tokenService.findToken(user.id, token_type, manager);
    if (!token) {
      this.createTokenSendEmail(user.id, token_type, user.email);
    } else {
      this.tokenService.delete(user.id, token_type, manager);
      this.createTokenSendEmail(user.id, token_type, user.email);
    }
  });
  }

  async changeUsername(user_id: UUID, new_username: string): Promise<User> {
    return await this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id: user_id } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      user.username = new_username;
      return await manager.save(user);
    });
  }



// * Email HTML Templates
private generateEmailTemplate({
  title,
  subtitle,
  code,
  codeColor,
  codeBackground,
  emoji,
  footer,
}: {
  title: string;
  subtitle: string;
  code: string;
  codeColor: string;
  codeBackground: string;
  emoji: string;
  footer: string[];
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .card { background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .title { font-size: 22px; font-weight: bold; color: #1f2937; margin-bottom: 10px; text-align: center; }
        .subtitle { font-size: 16px; color: #6b7280; margin-bottom: 20px; text-align: center; }
        .code-box { font-size: 32px; font-weight: bold; letter-spacing: 6px; color: ${codeColor}; background: ${codeBackground}; padding: 15px 20px; border-radius: 8px; text-align: center; }
        .footer { margin-top: 30px; font-size: 14px; color: #6b7280; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="title">${emoji} ${title}</div>
          <div class="subtitle">${subtitle}</div>
          
          <div class="code-box">${code}</div>
          
          <div class="footer">
            ${footer.map((line) => `<p>${line}</p>`).join("")}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
private generateVerificationCodeEmailHTML(code: string): string {
  return this.generateEmailTemplate({
    title: "Email Verification",
    subtitle: "Use the following code to verify your email address:",
    code,
    codeColor: "#2563eb",
    codeBackground: "#f3f4f6",
    emoji: "🔐",
    footer: [
      "If you did not request this code, please ignore this email.",
      "Thank you for using our service 🚀",
    ],
  });
}
private generateForgotPasswordOtpEmailHTML(code: string): string {
  return this.generateEmailTemplate({
    title: "Forgot Password",
    subtitle: "Use the OTP below to reset your password:",
    code,
    codeColor: "#dc2626",
    codeBackground: "#fef2f2",
    emoji: "🔑",
    footer: [
      "This OTP is valid for a limited time.",
      "If you did not request a password reset, please ignore this email.",
      "Stay secure 💡",
    ],
  });
}




}