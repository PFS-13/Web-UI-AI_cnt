// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, Req,Res,Patch,UseGuards, Query, HttpCode, Param, UnauthorizedException } from '@nestjs/common';
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
        maxAge: 120 * 60 * 1000,
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
    const { user_id } = await this.authService.register(auth_dto);
    return { user_id };
  }

    @Post('v1/login')
  async login(@Body() authDto: AuthDto, @Res({ passthrough: true }) res: Response) {
    const { access_token, refresh_token } = await this.authService.login(authDto);

    // production: secure: true, sameSite: 'none' if cross-site, set domain/path as needed
    res.cookie('Authentication', access_token, {
      httpOnly: true,
      secure: false, // change to true in prod (https)
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 min
      path: '/',
    });

    res.cookie('Refresh', refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
      path: '/auth', // optionally limit refresh cookie to /auth endpoints
    });

    return { message: 'Logged in' };
  }

  @Post('v1/refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshCookie = req.cookies['Refresh'];
    if (!refreshCookie) throw new UnauthorizedException('No refresh token');

    const { accessToken, newRefreshToken } = await this.authService.rotateRefreshToken(refreshCookie);

    // set new cookies (rotate)
    res.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    res.cookie('Refresh', newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/auth',
    });

    return { message: 'Token refreshed' };
  }

  @Post('v1/logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshCookie = req.cookies['Refresh'];
    if (refreshCookie) {
      // try to revoke the specific jti (best effort)
      try {
        const payload: any = this.authService['jwtService'].verify(refreshCookie, { secret: process.env.JWT_REFRESH_SECRET });
        if (payload?.jti) {
          await this.authService.revokeRefreshTokenByJti(payload.jti);
        }
      } catch (e) {
        // ignore
      }
    }

    // clear cookies
    res.clearCookie('Authentication', { path: '/' });
    res.clearCookie('Refresh', { path: '/auth' });

    return { message: 'Logged out' };
  }

  // Melakukan verifikasi OTP
  @Patch('v1/verify-otp')
  @ApiOperation({ summary: 'Verify OTP sent to email' })
  @ApiBody({type : VerifyOtpDto} )
  async verifyOtp(@Body() verifyOtp: VerifyOtpDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.verifyOtp(verifyOtp);
    if (result.accessToken) {
      // TODO: change secure to true in production
      res.cookie('Authentication', result.accessToken, {
      httpOnly: true,
      secure: false, 
      sameSite: 'lax',
      maxAge: 120 * 60 * 1000,
    });
    } 
    return { user_id: result.user_id };
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


  

}