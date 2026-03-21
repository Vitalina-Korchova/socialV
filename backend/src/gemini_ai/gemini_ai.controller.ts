import { Controller } from '@nestjs/common';
import { GeminiAiService } from './gemini_ai.service';

@Controller('gemini-ai')
export class GeminiAiController {
  constructor(private readonly geminiAiService: GeminiAiService) {}
}
