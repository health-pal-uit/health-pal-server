import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import { Meal } from 'src/meals/entities/meal.entity';
import { ILike } from 'typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { Activity } from 'src/activities/entities/activity.entity';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { Medal } from 'src/medals/entities/medal.entity';
import { PremiumPackage } from 'src/premium_packages/entities/premium_package.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { ChatReference } from './dto/chat_references.type';

@Injectable()
export class ChatAiService {
  private systemInstruction: string;
  private readonly ai: GoogleGenAI;
  private readonly logger = new Logger(ChatAiService.name);
  private readonly imageModel: string;
  // trusted health domains
  private readonly trustedDomains = ['who.int', 'nih.gov', 'cdc.gov', 'mayoclinic.org', 'nhs.uk'];

  constructor(
    @InjectRepository(Meal) private readonly mealsRepository: Repository<Meal>,
    @InjectRepository(Ingredient) private readonly ingredientsRepository: Repository<Ingredient>,
    @InjectRepository(Activity) private readonly activitiesRepository: Repository<Activity>,
    @InjectRepository(Challenge) private readonly challengesRepository: Repository<Challenge>,
    @InjectRepository(Medal) private readonly medalsRepository: Repository<Medal>,
    @InjectRepository(PremiumPackage)
    private readonly premiumPackagesRepository: Repository<PremiumPackage>,
    private readonly configService: ConfigService,
  ) {
    // load project_prompts
    const promptPath = path.join(process.cwd(), 'src/chat-ai/prompt/project_prompt.json');
    try {
      const promptData = JSON.parse(fs.readFileSync(promptPath, 'utf-8'));
      this.systemInstruction = `Project Overview: ${JSON.stringify(promptData, null, 2)}. Provide concise, code-grounded answers based on this context.`;
    } catch (error) {
      console.error('Error loading project prompt:', error);
      this.systemInstruction = 'assistant for health-pal-server. Provide helpful answers.';
    }

    this.ai = new GoogleGenAI({});
    this.imageModel = this.configService.get<string>('GEMINI_IMAGE_MODEL') || 'gemini-1.5-flash';
    this.logger.log(`Using Gemini image model: ${this.imageModel}`);
  }

  async chat(chatDto: {
    message: string;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  }) {
    const { message, history } = chatDto;
    let dbContext = '';

    // extract potential names and search specifically
    const extractName = (msg: string, keywords: string[]) => {
      const words = msg.toLowerCase().split(' ');
      const potentialNames = words.filter((w) => !keywords.some((k) => w.includes(k)));
      return potentialNames.length > 0 ? potentialNames[potentialNames.length - 1] : null;
    };

    // const foodWords = ['chicken', 'beef', 'rice', 'apple', 'pasta', 'salad', 'bread', 'cheese', 'milk', 'egg', 'fish', 'pork', 'vegetable', 'fruit', 'meat', 'drink', 'soup', 'pizza', 'burger', 'sandwich'];
    // const detectedFood = foodWords.find(word => message.toLowerCase().includes(word));

    // if (detectedFood) {
    //     console.log(`Detected food: ${detectedFood}`);
    //     const ingredients = await this.ingredientsRepository.find({ where: { name: ILike(`%${detectedFood}%`) }, take: 5 });
    //     const meals = await this.mealsRepository.find({ where: { name: ILike(`%${detectedFood}%`) }, take: 5 });
    //     console.log(`Ingredients: ${JSON.stringify(ingredients)}`);
    //     console.log(`Meals: ${JSON.stringify(meals)}`);
    //     dbContext += `Ingredients with "${detectedFood}": ${JSON.stringify(ingredients)}\n`;
    //     dbContext += `Meals with "${detectedFood}": ${JSON.stringify(meals)}\n`;
    // }

    if (
      message.toLowerCase().includes('meal') ||
      message.toLowerCase().includes('dish') ||
      message.toLowerCase().includes('food')
    ) {
      const name = extractName(message, ['meal', 'dish', 'food']);
      const meals = name
        ? await this.mealsRepository.find({ where: { name: ILike(`%${name}%`) }, take: 5 })
        : await this.mealsRepository.find({ take: 3 });
      dbContext += `Meals: ${JSON.stringify(meals)}\n`;
    }
    if (
      message.toLowerCase().includes('ingredient') ||
      message.toLowerCase().includes('nutrient')
    ) {
      const name = extractName(message, ['ingredient', 'nutrient']);
      const ingredients = name
        ? await this.ingredientsRepository.find({ where: { name: ILike(`%${name}%`) }, take: 5 })
        : await this.ingredientsRepository.find({ take: 3 });
      dbContext += `Ingredients: ${JSON.stringify(ingredients)}\n`;
    }
    if (message.toLowerCase().includes('activity') || message.toLowerCase().includes('exercise')) {
      const name = extractName(message, ['activity', 'exercise']);
      const activities = name
        ? await this.activitiesRepository.find({ where: { name: ILike(`%${name}%`) }, take: 5 })
        : await this.activitiesRepository.find({ take: 3 });
      dbContext += `Activities: ${JSON.stringify(activities)}\n`;
    }
    if (message.toLowerCase().includes('challenge')) {
      const name = extractName(message, ['challenge']);
      const challenges = name
        ? await this.challengesRepository.find({ where: { name: ILike(`%${name}%`) }, take: 5 })
        : await this.challengesRepository.find({ take: 3 });
      dbContext += `Challenges: ${JSON.stringify(challenges)}\n`;
    }
    if (message.toLowerCase().includes('medal')) {
      const name = extractName(message, ['medal']);
      const medals = name
        ? await this.medalsRepository.find({ where: { name: ILike(`%${name}%`) }, take: 5 })
        : await this.medalsRepository.find({ take: 3 });
      dbContext += `Medals: ${JSON.stringify(medals)}\n`;
    }
    if (message.toLowerCase().includes('package') || message.toLowerCase().includes('premium')) {
      const name = extractName(message, ['premium', 'package']);
      const premiumPackages = name
        ? await this.premiumPackagesRepository.find({
            where: { name: ILike(`%${name}%`) },
            take: 5,
          })
        : await this.premiumPackagesRepository.find({ take: 3 });
      dbContext += `Premium Packages: ${JSON.stringify(premiumPackages)}\n`;
    }

    const fullSystemInstruction = `${this.systemInstruction} ${dbContext ? `\n\nIMPORTANT: Use this DB data to answer questions about meals, ingredients, activities, etc. If the data shows matches, say YES and list them with emojis! If no matches, suggest checking the app tabs. DB Data:\n${dbContext}` : ''}\n\nReturn valid JSON only with this shape: {"answer":"string","references":[{"title":"string","url":"https://..."}]}. Include references only when useful, keep max 3, prefer trusted health domains (who.int, nih.gov, cdc.gov, mayoclinic.org, nhs.uk), and never invent uncertain links.`;

    //Logger.log('context:', dbContext)

    let contents = fullSystemInstruction + '\n';
    if (history && history.length > 0) {
      contents += 'Conversation history:\n';
      for (const h of history) {
        contents += `${h.role}: ${h.content}\n`;
      }
    }
    contents += `user: ${message}`;

    const res = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
    });
    const rawReply =
      res.candidates?.[0]?.content?.parts?.[0].text ?? 'Sorry, I could not generate a response.';
    const { reply, references } = this.parseChatResponse(rawReply);

    return {
      reply,
      references,
      history: [
        ...(history || []),
        { role: 'user', content: message },
        { role: 'assistant', content: reply },
      ],
    };
  }

  private parseChatResponse(rawText: string): {
    reply: string;
    references: ChatReference[];
  } {
    const fallbackReply = rawText?.trim() || 'Sorry, I could not generate a response.';
    const cleaned = this.stripCodeFence(rawText);

    try {
      // prefer structured json from model
      const parsed = JSON.parse(cleaned) as {
        answer?: unknown;
        references?: unknown;
      };

      const reply =
        typeof parsed.answer === 'string' && parsed.answer.trim().length > 0
          ? parsed.answer.trim()
          : fallbackReply;
      const references = this.sanitizeReferences(parsed.references);
      return { reply, references };
    } catch {
      // fallback to plain text and url scan
      return {
        reply: fallbackReply,
        references: this.extractReferencesFromText(fallbackReply),
      };
    }
  }

  private stripCodeFence(text: string): string {
    const trimmed = text.trim();
    if (!trimmed.startsWith('```')) {
      return trimmed;
    }

    // handle ```json wrappers
    return trimmed
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
  }

  private sanitizeReferences(input: unknown): ChatReference[] {
    if (!Array.isArray(input)) {
      return [];
    }

    // keep only valid and unique refs
    const result: ChatReference[] = [];
    const seen = new Set<string>();

    for (const item of input) {
      if (!item || typeof item !== 'object') {
        continue;
      }

      const title =
        'title' in item && typeof item.title === 'string' ? item.title.trim() : 'Reference';
      const url = 'url' in item && typeof item.url === 'string' ? item.url.trim() : '';
      if (!this.isValidReferenceUrl(url)) {
        continue;
      }

      if (seen.has(url)) {
        continue;
      }

      seen.add(url);
      result.push({ title: title || 'Reference', url });

      if (result.length >= 3) {
        break;
      }
    }

    return result;
  }

  private extractReferencesFromText(text: string): ChatReference[] {
    // fallback url extraction from answer text
    const urls = text.match(/https:\/\/[^\s)\]}"']+/g) || [];
    const rawRefs = urls.map((url) => ({ title: 'Reference', url }));
    return this.sanitizeReferences(rawRefs);
  }

  private isValidReferenceUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') {
        return false;
      }

      // allow only trusted hosts
      const host = parsed.hostname.toLowerCase();
      return this.trustedDomains.some((domain) => host === domain || host.endsWith(`.${domain}`));
    } catch {
      return false;
    }
  }
}
