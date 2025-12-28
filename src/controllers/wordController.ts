import { Request, Response } from 'express';
import { WordService } from '../services/wordService';
import { AuthRequest } from '../middlewares/authMiddleware';

import { CreateWordInput } from '../dtos/word.schema';
const wordService = new WordService();

export class WordController {

    async create(req: Request<{}, {}, CreateWordInput>, res: Response) {
        try {
            const userId = (req as AuthRequest).user!.id;
            const { text, hint, audioUrl, dictationId } = req.body;

            const word = await wordService.createWord(
                userId, 
                text, 
                dictationId, 
                hint || undefined, 
                audioUrl || undefined
            );

            res.status(201).json(word);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating word' });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const words = await wordService.getAllWords();
            res.json(words);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching words' });
        }
    }
    async delete(req: Request, res: Response) {
        try {
            const userId = (req as AuthRequest).user!.id;
            const wordId = Number(req.params.id);

            await wordService.deleteWord(wordId, userId);

            res.status(200).json({ message: 'Word deleted successfully' });
        } catch (error: any) {
            if (error.message === 'Access denied') {
                return res.status(403).json({ message: 'You cannot delete this word' });
            }
            if (error.message === 'Word not found') {
                return res.status(404).json({ message: 'Word not found' });
            }
            res.status(500).json({ message: 'Error deleting word' });
        }
    }
}