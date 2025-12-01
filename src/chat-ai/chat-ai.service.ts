import { Inject, Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import { Meal } from 'src/meals/entities/meal.entity';
import { Like, ILike } from 'typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { Activity } from 'src/activities/entities/activity.entity';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { Medal } from 'src/medals/entities/medal.entity';
import { PremiumPackage } from 'src/premium_packages/entities/premium_package.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as path from 'path';
import * as fs from 'fs';

type IngredientGeneratedImage = {
  name: string;
  mimeType: string;
  base64: string;
  dataUri: string;
};

@Injectable()
export class ChatAiService {
  private systemInstruction: string;
  private readonly ai: GoogleGenAI;
  private readonly logger = new Logger(ChatAiService.name);
  private readonly imageModel: string;

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

    const fullSystemInstruction = `${this.systemInstruction} ${dbContext ? `\n\nIMPORTANT: Use this DB data to answer questions about meals, ingredients, activities, etc. If the data shows matches, say YES and list them with emojis! If no matches, suggest checking the app tabs. DB Data:\n${dbContext}` : ''}`;

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
    const reply =
      res.candidates?.[0]?.content?.parts?.[0].text ?? 'Sorry, I could not generate a response.';

    return {
      reply,
      history: [
        ...(history || []),
        { role: 'user', content: message },
        { role: 'assistant', content: reply },
      ],
    };
  }

  async generateImagesForIngredients(): Promise<{ images: IngredientGeneratedImage[] }> {
    const targets = [
      'chicken breast',
      'pork loin',
      'beef steak',
      'salmon fillet',
      'shrimp',
      'egg',
      'milk',
      'yogurt',
      'cheddar cheese',
      'mozzarella',
      'rice',
      'pasta',
      'bread',
      'potato',
      'tomato',
      'broccoli',
      'spinach',
      'carrot',
      'apple',
      'banana',
    ];

    this.logger.log(`Generating ingredient images for ${targets.length} items`);
    const results: IngredientGeneratedImage[] = [];
    let quotaExceeded = false;
    let quotaMessage = '';

    for (const name of targets) {
      try {
        const prompt = `High-resolution photo of ${name} alone, centered, on a clean light background, in focus, no people, no props, no plate, food-safe, SFW.`;
        const res = await (this.ai.models.generateContent as any)({
          model: this.imageModel,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'image/png' },
        });
        const part = res.candidates?.[0]?.content?.parts?.[0];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = (part as any)?.inlineData?.data as string | undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mimeType = (part as any)?.inlineData?.mimeType as string | undefined;

        if (data && mimeType) {
          results.push({
            name,
            mimeType,
            base64: data,
            dataUri: `data:${mimeType};base64,${data}`,
          });
          this.logger.log(`Generated image for ${name}`);
        } else {
          this.logger.warn(`No inline image data returned for ${name}`);
        }
      } catch (error) {
        const msg = (error as Error).message;
        this.logger.warn(`Failed to generate image for ${name}: ${msg}`);
        if (msg && msg.toLowerCase().includes('quota')) {
          quotaExceeded = true;
          quotaMessage = msg;
          break; // stop after quota failure
        }
      }
    }

    this.logger.log(`Generated ${results.length}/${targets.length} ingredient images`);
    if (quotaExceeded && results.length === 0) {
      throw new Error(
        `Gemini image generation quota exceeded. Configure billing or try again later. Details: ${quotaMessage}`,
      );
    }
    return { images: results };
  }

  async testGenerateImage(model?: string): Promise<IngredientGeneratedImage | null> {
    const prompt =
      'Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme';

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
    });
    if (
      response.candidates &&
      response.candidates[0] &&
      response.candidates[0].content &&
      response.candidates[0].content.parts
    ) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          console.log(part.text);
        } else if (part.inlineData && part.inlineData.data) {
          const imageData = part.inlineData.data;
          const buffer = Buffer.from(imageData, 'base64');
          fs.writeFileSync('gemini-native-image.png', buffer);
          console.log('Image saved as gemini-native-image.png');
        }
      }
    }
    return null;
  }
}
