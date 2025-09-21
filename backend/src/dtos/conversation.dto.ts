import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString, IsEnum, IsEmail, isUUID } from 'class-validator';
import { UUID } from 'crypto';


export class getConversationByUserId {
  @ApiProperty({ example: 'userid123', description: 'ID User' })
  @IsUUID( )
  @IsNotEmpty()
  user_id: UUID;
}

export class editConversationDto {
  @ApiProperty({ example: 'conversationid123', description: 'ID User' })
  @IsUUID( )
  @IsNotEmpty()
  conversation_id: UUID;

  @ApiProperty({ example: 'New Title', description: 'Title of the conversation' })
  @IsString()
  @IsNotEmpty()
  title: string;
}

export class createConversationDto {
  @ApiProperty({ example: 'Top 10 Framework', description: 'Title of the conversation' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'userid123', description: 'ID User' })
  @IsUUID( )
  @IsNotEmpty()
  user_id: UUID;
}
