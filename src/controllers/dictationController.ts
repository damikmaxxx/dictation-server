import { Request, Response } from 'express';
import { DictationService } from '../services/dictationService';
import { AuthRequest } from '../middlewares/authMiddleware';
import {
  CreateDictationInput,
  UpdateDictationInput,
  CompleteDictationInput
} from '../dtos/dictation.schema';

const service = new DictationService();

export class DictationController {

  async create(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user!.id;
      const { title, language, description } = req.body;

      if (!title) return res.status(400).json({ message: 'Title required' });

      const dictation = await service.createDictation(userId, title, language || 'ru', description);
      res.status(201).json(dictation);
    } catch (error) {
      res.status(500).json({ message: 'Error creating dictation' });
    }
  }

  async createWithWords(req: Request<{}, {}, CreateDictationInput>, res: Response) {
    try {
      const userId = (req as AuthRequest).user!.id;
      const { title, language, words, description, isPublic } = req.body;

      const newDictation = await service.createDictationWithWords(
        userId,
        title,
        language,
        words,
        isPublic || false,
        description
      );
      res.status(201).json(newDictation);
    } catch (error: any) {
      console.error('Create Dictation Error:', error);
      if (error.message && error.message.includes('too long')) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({
        message: 'Error creating dictation with words.',
        details: error.message 
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user!.id;
      const dictationId = Number(req.params.id);

      const { title, description, language, words, isPublic } = req.body as UpdateDictationInput;
      if (!dictationId) {
        return res.status(400).json({ message: 'Invalid Dictation ID.' });
      }
      if (!words) {
        return res.status(400).json({ message: 'Words are required for full update.' });
      }

      if (!title) {
        return res.status(400).json({ message: 'Title is required for full update.' });
      }

      const updatedDictation = await service.updateFullDictation(
        dictationId,
        userId,
        title,
        description,
        language || 'ru',
        isPublic,
        words
      );

      res.status(200).json(updatedDictation);

    } catch (error: any) {
      if (error.message.includes('not the owner')) {
        return res.status(403).json({ message: 'Access denied: not the owner.' });
      }
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: 'Dictation not found.' });
      }
      console.error('Update Dictation Error:', error);
      res.status(500).json({ message: 'Internal server error during update.' });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user!.id;
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

  async complete(req: Request<{}, {}, CompleteDictationInput>, res: Response) {
    try {
      const userId = (req as AuthRequest).user!.id;

      const { dictationId, score, totalWords, correctCount, errors } = req.body;

      const result = await service.savePractice(
        userId,
        dictationId,
        score,
        totalWords,
        correctCount,
        errors
      );
      res.status(201).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error saving result' });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user!.id;
      const dictationId = Number(req.params.id);


      await service.deleteDictation(dictationId, userId);

      res.status(200).json({ message: 'Dictation deleted successfully.' });
    } catch (error: any) {
      if (error.message.includes('not the owner')) return res.status(403).json({ message: 'Access denied.' });
      if (error.message.includes('not found')) return res.status(404).json({ message: 'Dictation not found.' });

      res.status(500).json({ message: 'Error deleting dictation.' });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user!.id;
      const history = await service.getHistory(userId);
      res.json(history);
    } catch (error) {
      console.error('Get History Error:', error);
      res.status(500).json({ message: 'Error fetching history.' });
    }
  }
  async getPublic(req: Request, res: Response) {
    try {
      const list = await service.getPublic();
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching public dictations' });
    }
  }
}