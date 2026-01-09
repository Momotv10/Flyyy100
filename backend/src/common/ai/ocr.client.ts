import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
// Fix: Added explicit import for Buffer to resolve 'Cannot find name Buffer' error
import { Buffer } from 'buffer';

@Injectable()
export class OcrClient {
  private readonly AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  // Fix: Buffer type is now correctly resolved via the explicit import
  async analyzePassport(imageBuffer: Buffer, fileName: string) {
    try {
      const form = new FormData();
      form.append('file', imageBuffer, { filename: fileName });

      const response = await axios.post(`${this.AI_SERVICE_URL}/ocr/passport`, form, {
        headers: { ...form.getHeaders() },
      });

      return response.data;
    } catch (error) {
      console.error('OCR Service Error:', error.message);
      throw new InternalServerErrorException('فشل الاتصال بمحرك الذكاء الاصطناعي لمعالجة الجواز');
    }
  }
}
