import { Module } from '@nestjs/common';
import { GeminiAiService } from './gemini_ai.service';
import { GeminiAiController } from './gemini_ai.controller';

@Module({
  controllers: [GeminiAiController],
  exports: [GeminiAiService],
  providers: [GeminiAiService],
})
export class GeminiAiModule {}
