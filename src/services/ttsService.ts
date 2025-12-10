import { getAudioUrl } from 'google-tts-api';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { Stream } from 'stream'; 
export class TtsService {
  
  async generateAndSave(text: string, lang: string = 'en'): Promise<string | null> {
    

    try {
      console.log(`🎙️ Генерируем звук для "${text}" (${lang}) через Free TTS...`);
      const url = await this.tryFree(text, lang);
      if (url) return url;
    } catch (e) {
      console.error('⚠️ Free Server TTS не сработал. Оставляем озвучку на Клиент.', e);
    }

    return null;
  }

  private async tryFree(text: string, lang: string): Promise<string> {
    const url = getAudioUrl(text, {
      lang: lang,
      slow: false,
      host: 'https://translate.google.com',
    });

    return await this.downloadAndSave(url);
  }

 private async downloadAndSave(url: string): Promise<string> {
    
    const uploadDir = path.join(__dirname, '../../uploads'); 
    
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `tts-${Date.now()}-${Math.round(Math.random() * 1000)}.mp3`;
    const filePath = path.join(uploadDir, fileName);

    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream'
    });
    
    const audioStream = response.data as Stream; 

    const writer = fs.createWriteStream(filePath);
    audioStream.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(`/uploads/${fileName}`));
      writer.on('error', (err) => {
        console.error('Download error:', err);
        reject(err);
      });
    });
  }
}