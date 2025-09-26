// src/auth/strategies/google.strategy.ts
import { PassportStrategy } from '@nestjs/passport'; 
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Request } from 'express';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
      scope: ['email', 'profile'],
      passReqToCallback: true, // <-- penting supaya req bisa dipakai

    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { sub, displayName, emails, photos } = profile;
    const email = emails?.[0]?.value;
    const username = displayName;
    const image_url = photos?.[0]?.value || null;

    if (!email) {
      return done(new UnauthorizedException('Email not found'), false);
    }

    // Pass all user info ke controller
    done(null, { id: sub, username, email, image_url });
  }
}
