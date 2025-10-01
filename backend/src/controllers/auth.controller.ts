// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, Req,Res,Patch,UseGuards, Query, HttpCode, Param } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthDto, VerifyOtpDto} from '../dtos/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'; 
import { GoogleAuthGuard } from '../auth/google-auth.guard';
import { ApiBody, ApiOperation,ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/get-user.decorator';
import { TokenType } from 'src/entity/token.entity';
import { UUID } from 'crypto';
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
      id: string;
      username: string;
      email: string;
      image_url: string;
    };
    const { token } = await this.authService.handleGoogleLogin({ username, email, image_url });
    const frontendUrl = process.env.FRONTEND_URL;
    // TODO: change secure to true in production
    res.cookie('Authentication', token, {
      httpOnly: true, 
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
    });
    return res.redirect(`${frontendUrl}/auth-callback?token=${token}`);
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('v1/me')
  getProfile(@GetUser() user: any) {
    return user; 
  }
  // --------------- Login Manual --------------- 
  // Pengecekan Email
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
  async checkEmail(@Body('email') email: string) {
    const provider = await this.authService.checkEmail(email);
    return { provider };
  }

  // Melakukan registrasi user
  @Post('v1/register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({type : AuthDto})
  async register(
    @Body() auth_dto: AuthDto,
    @Res({ passthrough: true }) res: Response) {
    const { accessToken, user_id } = await this.authService.register(auth_dto);
    // TODO: change secure to true in production
    res.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: false, 
      sameSite: 'lax',
      maxAge: 1000 * 60 * 15
    });
    return { user_id };
  }

  // Login Manual
  @Post('v1/login')
  @ApiOperation({ summary: 'Login' })
  @ApiBody({type : AuthDto})
  async login(
    @Body() auth_dto: AuthDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const token = await this.authService.login(auth_dto);
    // TODO: change secure to true in production
    res.cookie('Authentication', token.accessToken, {
      httpOnly: true,
      secure: false, 
      sameSite: 'lax',
      maxAge: 1000 * 60 * 15
    });
    return { message: 'Logged in' };
  }

  // Melakukan verifikasi OTP
  @Patch('v1/verify-otp')
  @ApiOperation({ summary: 'Verify OTP sent to email' })
  @ApiBody({type : VerifyOtpDto} )
  async verifyOtp(@Body() verifyOtp: VerifyOtpDto) {
    return await this.authService.verifyOtp(verifyOtp);

  }
  
  // Pengiriman kembali email
  @Post('v1/resend-email')
  @HttpCode(200)
  @ApiOperation({ summary: 'Resend email for verification / Forgot Password' })
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
  async resendEmail(@Body('email') email: string, @Body('token_type') token_type: TokenType) {
    const resendEmail =  await this.authService.resendEmail(email, token_type);
    return {resendEmail}
  }
  @Patch('v1/users/:user_id/change-password')
  @ApiOperation({ summary: 'Change user password' })
  async changePassword(@Param('user_id') user_id: UUID, @Body('new_password') new_password: string) {
    return await this.authService.changePassword(user_id, new_password);
  }

  @Patch('v1/users/:user_id/change-username')
  @ApiOperation({ summary: 'Change user username' })
  async changeUsername(@Param('user_id') user_id: UUID, @Body('username') username: string) {
    return await this.authService.changeUsername(user_id, username);
  }


@Post('v1/logout')
logout(@Res({ passthrough: true }) res: Response) {
  res.clearCookie('Authentication');
  return { message: 'Logged out' };
}
  

}