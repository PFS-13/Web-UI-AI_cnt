// src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus,UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthDto } from '../dtos/login.dto';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
// 
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('check-email')
  async checkEmail(@Body() email: string) {
    return await this.authService.checkEmail(email);
  }

  @Post('register')
  async register(@Body() auth_dto: AuthDto) {
    return await this.authService.register(auth_dto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body('otp') otp: string, @Body('email') email: string) {
    return await this.authService.verifyOtp(otp, email);
  }

}