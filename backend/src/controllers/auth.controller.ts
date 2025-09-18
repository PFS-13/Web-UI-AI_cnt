// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, Req,Res,Patch,UseGuards, Query, HttpCode } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthDto, VerifyOtpDto, CheckEmailResponseDto, RegisterResponseDto, VerifyOtpResponseDto} from '../dtos/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { GoogleAuthGuard } from '../auth/google-auth.guard';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService
  ) {}
@Get('google')
  @ApiOperation({ summary: 'Login by Google' })
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req: any, @Res() res: Response, @Query('email') email: string) {
    const authenticator = new (AuthGuard('google'))();
    req.query = {
      ...req.query,
      login_hint: email,
  };
  return authenticator.canActivate(req);
}
@Get('google/callback')
  @ApiOperation({ summary: 'Callback after successfull login' })
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const { username, email, image_url } = req.user as {
      google_id: string;
      username: string;
      email: string;
      image_url: string;
    };

    const { token } = await this.authService.handleGoogleLogin({ username, email, image_url });
    const frontendUrl = process.env.FRONTEND_URL;
    res.cookie('token', token, {
      httpOnly: false, 
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 60 * 1000,
    });

    return res.redirect(`${frontendUrl}/auth-callback?token=${token}`);
  }
  
  @Post('v1/check-email')
  @HttpCode(200)
  @ApiOperation({ summary: 'Check email that user inputed' })
    @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'user@example.com',
        },
      },
      required: ['email'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Email check result (provider jika ada, null jika tidak)',
    type: CheckEmailResponseDto,
  })
  async checkEmail(@Body('email') email: string) {
    return await this.authService.checkEmail(email);
  }

  // Melakukan registrasi user
  @Post('v1/register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({type : AuthDto})
  @ApiCreatedResponse({
  description: 'User registered successfully. Verification email sent.',
  type: RegisterResponseDto,
})
  async register(@Body() auth_dto: AuthDto) {
    return await this.authService.register(auth_dto);
  }

  // Melakukan verifikasi OTP
  @Patch('v1/verify-otp')
  @ApiOperation({ summary: 'Verify OTP sent to email' })
  @ApiBody({type : VerifyOtpDto} )
  @ApiResponse({
    status: 200,
    description: 'User verified successfully.',
    type: VerifyOtpResponseDto,
  })
  async verifyOtp(@Body() verifyOtp: VerifyOtpDto) {
    return await this.authService.verifyOtp(verifyOtp);
  }

}