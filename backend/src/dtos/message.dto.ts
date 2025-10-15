import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsUUID, IsString,  IsBoolean, IsOptional, IsNumber} from 'class-validator';
import { UUID } from 'crypto';


export class getMessageDto{
  @ApiProperty({ example: 'conversationid123', description: 'ID Conversation' })
  @IsUUID( )
  @IsNotEmpty() 
  conversation_id :UUID
}

export class createMessageDto {
  @ApiProperty({ 
    example: 'conv123ID', 
    description: 'ID of the conversation' 
  })
  @IsUUID()
  @IsNotEmpty()
  conversation_id: UUID;

  @ApiProperty({ 
    example: 'Give me example of ....', 
    description: 'Message that the user or AI sends' 
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  // @ApiProperty({ 
  //   description: 'True if the user sends the message, false if it’s an AI response', 
  //   example: true 
  // })
  // @Transform(({ value }) => value === 'true' || value === true)
  // @IsBoolean()
  // is_user: boolean;

  // @ApiProperty({ 
  //   description: 'True if the message has an attached file, false if not', 
  //   example: false 
  // })
  // @Transform(({ value }) => value === 'true' || value === true)
  // @IsBoolean()
  // is_attach_file: boolean;

  // @ApiProperty({ 
  //   description: 'ID of the message this one was edited from', 
  //   example: 42, 
  //   required: false 
  // })
  // @Transform(({ value }) => value ? Number(value) : undefined)
  // @IsOptional()
  // @IsNumber()
  // edited_from_message_id?: number;

  // @ApiProperty({ 
  //   description: 'ID of the message this one is replying to', 
  //   example: 15, 
  //   required: false 
  // })
  // @Transform(({ value }) => value ? Number(value) : undefined)
  // @IsOptional()
  // @IsNumber()
  // parent_message_id?: number;
}

  export type AskPayload = createMessageDto & { file?: Express.Multer.File };


  export class editMessageDto {

    @ApiProperty({ 
      example: 'conv123ID', 
      description: 'ID of the conversations' 
    })
    @IsString()
    @IsNotEmpty() 
    conversation_id: string;
  
      @ApiProperty({ 
        example: 'Give me example of .... ', 
        description: 'Message the user / AI send' 
      })
      @IsString()
      @IsNotEmpty() 
      content: string;
    
      @ApiProperty({ 
        description: 'True if user the one who send the message. False if the message is AI Response', example : true 
      })
      @IsBoolean()
      @IsNotEmpty() 
      is_from_sender: boolean; 
    
      @ApiProperty({ 
        description: 'True if the message also attach file. False if not', example : false 
      })
      @IsBoolean()
      @IsNotEmpty() 
      is_attach_file: boolean; 
  
      @ApiProperty({ 
        description: 'Message was edited from other message', 
      })
      @IsNumber()
      @IsOptional() 
      edited_from?: number; 
  
    }

