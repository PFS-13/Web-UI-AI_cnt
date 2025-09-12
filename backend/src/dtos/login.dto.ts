import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString, IsEnum, IsEmail } from 'class-validator';

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