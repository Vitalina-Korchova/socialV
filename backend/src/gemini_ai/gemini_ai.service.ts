import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  RequestDataDTOAIGemini,
  ResponseDataAIGemini,
} from './dto/gemini_ai.dto';

@Injectable()
export class GeminiAiService {
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: any;

  constructor(private configService: ConfigService) {
    const apiKey = configService.getOrThrow<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });
  }

  async filteredPost(
    objectRequest: RequestDataDTOAIGemini,
  ): Promise<ResponseDataAIGemini | null> {
    try {
      const prompt = `
  You are an AI recommendation system for a social media feed.
  
  Your task is to select the most relevant posts for a user based on their interests and behavior.
  
  ### INPUT DATA
  
  1. recent_actions:
  Posts the user recently interacted with (likes, comments, reposts, created posts, bookmarks ).
  These represent the user's preferences.
  
  2. follower_posts:
  Posts from users that the user follows.
  These MUST be prioritized and INCLUDED in the final result.
  
  3. general_posts:
  A large pool of posts (200-500) that should be filtered based on relevance.
  
  Each post contains:
  - id (number)
  - text (string)
  - tags (array of strings)
  - images (array of base64 images with mimeType)
  
  You must analyze:
  - text meaning
  - tags
  - image content (if present)
  
  ---
  
  ### RULES
  
  1. ALWAYS include relevant posts from follower_posts.
  2. Prioritize posts similar to recent_actions (user interests).
  3. Filter OUT irrelevant or unrelated posts.
  4. Avoid duplicates.
  5. Return ONLY post IDs.
  6. Ensure diversity but keep personalization strong.
  7. Return between 20 and 50 post IDs.
  8. At least 40% of results should come from follower_posts if available.
  9. Do NOT include any explanation or text outside JSON.
  
  ---
  
  ### OUTPUT FORMAT (STRICT JSON)
  
  {
    "filtered_post_ids": number[]
  }
  
  ---
  
  ### DATA
  
  recent_actions:
  ${JSON.stringify(objectRequest.recent_actions)}
  
  follower_posts:
  ${JSON.stringify(objectRequest.follower_posts)}
  
  general_posts:
  ${JSON.stringify(objectRequest.general_posts)}
  `;

      console.log('--- GEMINI PROMPT ---');
      console.log(prompt);
      console.log('--------------------');

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();

      console.log('--- GEMINI RESPONSE ---');
      console.log(text);
      console.log('-----------------------');

      // очистка від ```json ```
      const clean = text.replace(/```json|```/g, '').trim();

      return JSON.parse(clean);
    } catch (e) {
      console.error('Gemini Error:', e);
      return null;
    }
  }
}
