import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString, IsEnum, IsEmail } from 'class-validator';
import { UUID } from 'crypto';

export class CheckEmailResponseDto {
  @ApiProperty({
    example: 'google',
    nullable: true,
    description: 'Provider yang digunakan user, null jika email belum terdaftar',
  })
  provider: string | null;
}

export class RegisterResponseDto {
  @ApiProperty({
    example: 'Registration successful. Please check your email for verification.',
  })
  message: string;

  @ApiProperty({ example: 'userId123', description: 'ID of user' })
  user_id: UUID;
}

export class VerifyOtpResponseDto {
  @ApiProperty({
    example: 'User verified successfully.',
  })
  message: string;
}

export class AuthDto {
  @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'The password of the user' })
  @IsString( )
  @IsNotEmpty()
  password: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '123456', description: 'The Code sent to the user email' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'userId123', description: 'Email of the user' })
  @IsString()
  @IsNotEmpty()
  email: string;
}