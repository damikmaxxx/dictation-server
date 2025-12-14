import prisma from '../db';
import { TtsService } from './ttsService';
import { Prisma } from '@prisma/client';

export interface WordItem {
    text: string;
    hint?: string;
    audioUrl?: string;
}


export class DictationService {
  async createDictation(userId: number, title: string, language: string, description?: string) {
    return await prisma.dictation.create({
      data: {
        title,
        language,
        description,
        authorId: userId
      }
    });
  }

  async createDictationWithWords(
        userId: number, 
        title: string, 
        language: string, 
        wordsArray: WordItem[],
        description?: string 
    ) {
    return prisma.$transaction(async (tx) => {

      const newDictation = await tx.dictation.create({
        data: {
          title,
          language,
          description,
          authorId: userId,
        },
      });
      console.log(wordsArray," wordsArray");
      const wordsToInsert = [];
      const ttsServiceInstance = new TtsService();

      for (const wordData of wordsArray) {
        let audioUrl: string | null = wordData.audioUrl || null; 

        if (audioUrl === null) {
          const lang = language || 'ru';
          audioUrl = await ttsServiceInstance.generateAndSave(wordData.text, lang);
        }

        wordsToInsert.push({
          text: wordData.text,
          hint: wordData.hint,
          audioUrl: audioUrl, 
          authorId: userId,
          dictationId: newDictation.id,
        });
      }

      await tx.word.createMany({
        data: wordsToInsert,
      });

      return newDictation; 
    });
  }

  async getAll(userId: number) {
    return await prisma.dictation.findMany({
      where: { authorId: userId },
      include: { words: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getOne(dictationId: number) {
    return await prisma.dictation.findUnique({
      where: { id: dictationId },
      include: { words: true }
    });
  }

  async savePractice(userId: number, dictationId: number, score: number, totalWords: number, correctCount: number, errors: any[]) {
    
    const errorsData = errors.length > 0 ? errors : Prisma.DbNull; 

    return await prisma.dictationPractice.create({
      data: {
        userId,
        dictationId,
        score,
        totalWords,
        correctCount,
        errors: errorsData, 
      }
    });
  }
  async deleteDictation(dictationId: number, userId: number) {

    const dictation = await prisma.dictation.findUnique({
      where: { id: dictationId }
    });

    if (!dictation) {
      throw new Error('Dictation not found');
    }

    if (dictation.authorId !== userId) {
      throw new Error('Access denied: not the owner');
    }

    await prisma.word.deleteMany({
      where: { dictationId: dictationId }
    });

    await prisma.dictationPractice.deleteMany({
      where: { dictationId: dictationId }
    });

    return await prisma.dictation.delete({
      where: { id: dictationId }
    });
  }


  async updateFullDictation(
        dictationId: number, 
        userId: number, 
        title: string, 
        description: string | undefined, 
        language: string, 
        wordsArray: WordItem[]
    ) {
        const dictation = await prisma.dictation.findUnique({ where: { id: dictationId } });
        if (!dictation) throw new Error('Dictation not found');
        if (dictation.authorId !== userId) throw new Error('Access denied: not the owner');

        return prisma.$transaction(async (tx) => {
            
            await tx.dictation.update({
                where: { id: dictationId },
                data: { title, description, language }
            });

            await tx.word.deleteMany({
                where: { dictationId: dictationId }
            });

            const wordsToInsert = [];
            const ttsServiceInstance = new TtsService();

            for (const wordData of wordsArray) {
                
                const lang = language || 'ru'; 
                const audioUrl = await ttsServiceInstance.generateAndSave(wordData.text, lang);

              wordsToInsert.push({
                  text: wordData.text,
                  hint: wordData.hint || null, 
                  audioUrl: audioUrl,
                  authorId: userId,
                  dictationId: dictationId,
              });
            }

            await tx.word.createMany({
                data: wordsToInsert,
            });

            return tx.dictation.findUnique({ where: { id: dictationId } }); 
        });
    }
}