import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, MaxLength } from 'class-validator';

export class PostRequest {
  id: number;
  @IsNotEmpty({ message: 'Text content is required' })
  @MaxLength(250, { message: 'Text conten is too long' })
  text_content: string;
  @IsInt()
  @Type(() => Number)
  user_id: number;
  created_at: Date;
}

export class PostResponse {}
