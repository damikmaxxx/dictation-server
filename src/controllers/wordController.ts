import { Request, Response } from 'express';
import { WordService } from '../services/wordService';
import { AuthRequest } from '../middlewares/authMiddleware';

const wordService = new WordService();

export class WordController {

    async create(req: Request, res: Response) {
        try {
            const userId = (req as AuthRequest).user?.id;
            const { text, hint, audioUrl, dictationId } = req.body;

            if (!userId) return res.status(401).json({ message: 'Unauthorized' });
            if (!text) return res.status(400).json({ message: 'Text required' });
            if (!dictationId) return res.status(400).json({ message: 'Dictation ID required' });

            const word = await wordService.createWord(userId, text, Number(dictationId), hint, audioUrl);

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
            const userId = (req as AuthRequest).user?.id;
            const wordId = Number(req.params.id);

            if (!userId) return res.status(401).json({ message: 'Unauthorized' });
            if (!wordId) return res.status(400).json({ message: 'Word ID required' });

            await wordService.deleteWord(wordId, userId);

            res.status(200).json({ message: 'Word deleted successfully' });
        } catch (error: any) {
            if (error.message === 'Access denied') {
                return res.status(403).json({ message: 'You cannot delete this word' });
            }
            res.status(500).json({ message: 'Error deleting word' });
        }
    }
}