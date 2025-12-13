import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData from 'form-data';

@Injectable()
export class FoodVisionService {
  constructor(private readonly config: ConfigService) {
    this.food_url = this.config.get<string>('FOOD_VISION_URL')!;
  }
  food_url: string;

  async analyzeFoodImage(image: Express.Multer.File) {
    const formData = new FormData();
    formData.append('file', image.buffer, {
      filename: image.originalname,
      contentType: image.mimetype,
    });
    const response = await axios.post(this.food_url, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    return response.data.labels;
  }
}
