import { Request, Response } from 'express';
import { DictationService } from '../services/dictationService';
import { AuthRequest } from '../middlewares/authMiddleware';

const service = new DictationService();

export class DictationController {

  async create(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user?.id;
      const { title, language, description } = req.body;

      if (!userId || !title) return res.status(400).json({ message: 'Title required' });

      const dictation = await service.createDictation(userId, title, language || 'ru', description);
      res.status(201).json(dictation);
    } catch (error) {
      res.status(500).json({ message: 'Error creating dictation' });
    }
  }
  async createWithWords(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user?.id;
      const { title, language, words, description } = req.body;

      if (!userId || !title || !words || !Array.isArray(words)) {
        return res.status(400).json({ message: 'Title and array of words are required.' });
      }

      const cleanWords = words
        .filter((w: any) => w && w.text && w.text.trim().length > 0)
        .map((w: any) => ({
          text: w.text.trim(),
          hint: w.hint || null, 
          audioUrl: w.audioUrl || null
        }));

      if (cleanWords.length === 0) {
        return res.status(400).json({ message: 'The list of words cannot be empty.' });
      }

      const newDictation = await service.createDictationWithWords(
        userId,
        title,
        language || 'ru',
        cleanWords as any, 
        description
      );
      res.status(201).json(newDictation);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating dictation with words.' });
    }
  }
  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user?.id;
      if (!userId) return res.status(401).end();

      const list = await service.getAll(userId);
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching dictations' });
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const dictation = await service.getOne(id);
      if (!dictation) return res.status(404).json({ message: 'Dictation not found' });
      res.json(dictation);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching dictation' });
    }
  }

  async complete(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user?.id;
      const { dictationId, score } = req.body;

      if (!userId || !dictationId || score === undefined) {
        return res.status(400).json({ message: 'Missing data' });
      }

      const result = await service.savePractice(userId, Number(dictationId), Number(score));
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error saving result' });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user?.id;
      const dictationId = Number(req.params.id);

      if (!userId || !dictationId) return res.status(400).json({ message: 'Missing ID or unauthorized' });

      await service.deleteDictation(dictationId, userId);

      res.status(200).json({ message: 'Dictation and all related words deleted successfully.' });
    } catch (error: any) {
      if (error.message.includes('not the owner')) {
        return res.status(403).json({ message: 'Access denied: You can only delete your own dictations.' });
      }
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: 'Dictation not found.' });
      }
      res.status(500).json({ message: 'Error deleting dictation.' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user?.id;
      const dictationId = Number(req.params.id);
      const { title, description, language, words } = req.body;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      if (!dictationId || !title || !words || !Array.isArray(words)) {
        return res.status(400).json({ message: 'Full dictation object (ID, title, and words) is required for update.' });
      }

      const cleanWords = words
        .filter((w: any) => w && w.text && w.text.trim().length > 0)
        .map((w: any) => ({
          text: w.text.trim(),
          hint: w.hint || null,
          audioUrl: w.audioUrl || null
        }));

      if (cleanWords.length === 0) {
        return res.status(400).json({ message: 'Word list cannot be empty or invalid.' });
      }

      const updatedDictation = await service.updateFullDictation(
        dictationId,
        userId,
        title,
        description,
        language || 'ru',
        cleanWords as any
      );

      res.status(200).json(updatedDictation);

    } catch (error: any) {
      if (error.message.includes('not the owner')) {
        return res.status(403).json({ message: 'Access denied: You can only update your own dictations.' });
      }
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: 'Dictation not found.' });
      }
      console.error('Update Dictation Error:', error);
      res.status(500).json({ message: 'Internal server error during update.' });
    }
  }
}