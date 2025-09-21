import { ApiProperty } from '@nestjs/swagger';
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
    description: 'ID of the conversations' 
  })
  @IsUUID()
  @IsNotEmpty() 
  conversation_id: UUID;

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
      description: 'Message was edited from other meessage', example : 'conve123ID' 
    })
    @IsNumber()
    @IsOptional() 
    edited_from?: number; 

  }

  export class editMessageDto {

    @ApiProperty({ 
      example: 'conv123ID', 
      description: 'ID of the conversations' 
    })
    @IsUUID()
    @IsNotEmpty() 
    conversation_id: UUID;
  
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

