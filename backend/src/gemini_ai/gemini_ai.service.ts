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

  async sortedPost(
    objectRequest: RequestDataDTOAIGemini,
  ): Promise<ResponseDataAIGemini | null> {
    try {
      console.log(
        `[GeminiAI] Request: ${objectRequest.recent_actions.length} actions, ${objectRequest.follower_posts.length} follower_posts, ${objectRequest.general_posts.length} general_posts`,
      );

      const allPostIds = [
        ...objectRequest.follower_posts.map((p) => p.id),
        ...objectRequest.general_posts.map((p) => p.id),
      ];

      const prompt = `
      You are an AI recommendation system for a social media feed.

      Your task is to SORT all provided posts by relevance for a specific user based on their interests and behavior.

      ### INPUT DATA

      1. recent_actions:
      Posts the user recently interacted with (likes, comments, reposts, created posts, bookmarks).
      These represent the user's current interests and preferences.

      2. follower_posts:
      Posts from users that the user follows.
      These MUST appear near the TOP of the sorted result.

      3. general_posts:
      A pool of posts that should be ranked by relevance.

      Each post contains:
      - id (number)
      - text (string)
      - tags (array of strings)

      You must analyze:
      - text meaning and topic similarity to recent_actions
      - tags overlap with recent_actions
      - whether it is from a followed user (follower_posts)

      ---

      ### RULES

      1. ALWAYS place follower_posts near the top of the sorted list.
      2. Sort general_posts by topic/tag similarity to recent_actions.
      3. Do NOT remove any posts from the list — return ALL post IDs, just sorted by relevance.
      4. No duplicates.
      5. Return ONLY post IDs in descending relevance order.
      6. Do NOT include any explanation or text outside JSON.

      ---

      ### OUTPUT FORMAT (STRICT JSON)

      {
        "ranked_post_ids": number[]
      }

      ---

      ### DATA

      recent_actions:
      ${JSON.stringify(objectRequest.recent_actions.map(({ images: _i, ...rest }) => rest))}

      follower_posts:
      ${JSON.stringify(objectRequest.follower_posts.map(({ images: _i, ...rest }) => rest))}

      general_posts:
      ${JSON.stringify(objectRequest.general_posts.map(({ images: _i, ...rest }) => rest))}

      Total post IDs that MUST appear in ranked_post_ids (${allPostIds.length} total):
      ${JSON.stringify(allPostIds)}
      `;

      const contentParts: any[] = [{ text: prompt }];

      for (const action of objectRequest.recent_actions) {
        for (const img of action.images ?? []) {
          contentParts.push({
            inlineData: { mimeType: img.mimeType, data: img.data },
          });
        }
      }
      for (const post of objectRequest.follower_posts) {
        for (const img of post.images ?? []) {
          contentParts.push({
            inlineData: { mimeType: img.mimeType, data: img.data },
          });
        }
      }

      console.log(`Sending to Gemini: ${contentParts.length - 1} image(s)`);

      const result = await this.model.generateContent(contentParts);
      const text = result.response.text();

      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean) as ResponseDataAIGemini;

      return parsed;
    } catch (e) {
      return null;
    }
  }
}
