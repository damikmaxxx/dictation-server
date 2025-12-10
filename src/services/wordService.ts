import prisma from '../db';

export class WordService {
    async createWord(userId: number, text: string, dictationId: number, hint?: string, audioUrl?: string) {
        return await prisma.word.create({
            data: {
                text,
                hint,
                audioUrl,
                authorId: userId, 
                dictationId: dictationId 
            },
        });
    }


    async getAllWords() {
        return await prisma.word.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }


    async deleteWord(wordId: number, userId: number) {
        const word = await prisma.word.findUnique({
            where: { id: wordId }
        });

        if (!word) throw new Error('Word not found');

        if (word.authorId !== userId) {
            throw new Error('Access denied');
        }

        return await prisma.word.delete({
            where: { id: wordId }
        });
    }

}