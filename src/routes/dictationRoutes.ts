import { Router } from 'express';
import { DictationController } from '../controllers/dictationController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validate';
import { 
  createDictationSchema, 
  updateDictationSchema, 
  completeDictationSchema, 
  dictationIdSchema 
} from '../dtos/dictation.schema';

const router = Router();
const controller = new DictationController();
router.use(authMiddleware);

/**
 * @swagger
 * /dictations:
 *   post:
 *     summary: Создание нового диктанта (папки) со списком слов
 *     tags: [Dictations]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Словарные слова 7 класс
 *               language:
 *                 type: string
 *                 example: ru
 *               description:
 *                 type: string
 *                 example: Этот диктант для 7 класса
 *               words:
 *                 type: array
 *                 description: Список слов (массив объектов)
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                       example: Phenomenon
 *                     hint:
 *                       type: string
 *                       example: Явление
 *                     audioUrl:
 *                       type: string
 *                       example: /uploads/tts-123.mp3
 *             required: [title, words]
 *     responses:
 *       201:
 *         description: Диктант успешно создан.
 *       400:
 *         description: Ошибка валидации.
 *   get:
 *     summary: Получение списка всех диктантов пользователя
 *     tags: [Dictations]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Список диктантов пользователя с вложенными словами.
 */
router.post('/', validate(createDictationSchema), controller.createWithWords.bind(controller));
router.get('/', controller.getAll.bind(controller));

/**
 * @swagger
 * /dictations/complete:
 *   post:
 *     summary: Сохранение сводного отчета о прохождении диктанта
 *     tags: [Dictations]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dictationId:
 *                 type: integer
 *                 example: 5
 *               score:
 *                 type: integer
 *                 example: 85
 *               totalWords:
 *                 type: integer
 *                 example: 10
 *               correctCount:
 *                 type: integer
 *                 example: 8
 *               errors:
 *                 type: array
 *                 description: Массив ошибок
 *                 items:
 *                   type: object
 *                   properties:
 *                     word: { type: string }
 *                     userInput: { type: string }
 *             required: [dictationId, score, totalWords, correctCount]
 *     responses:
 *       201:
 *         description: Результат сохранен.
 */
router.post('/complete', validate(completeDictationSchema), controller.complete.bind(controller));

/**
 * @swagger
 * /dictations/history:
 *   get:
 *     summary: Получение полной истории прохождения диктантов
 *     tags: [Dictations]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Список результатов.
 */
router.get('/history', controller.getHistory.bind(controller));



/**
 * @swagger
 * /dictations/public:
 *   get:
 *     summary: Получение списка публичных диктантов (Библиотека)
 *     tags: [Dictations]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Список всех публичных диктантов.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   language:
 *                     type: string
 *                   isPublic:
 *                     type: boolean
 *                   author:
 *                     type: object
 *                     properties:
 *                       name: { type: string }
 *                   words:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         text: { type: string }
 */
router.get('/public', controller.getPublic.bind(controller));

/**
 * @swagger
 * /dictations/{id}:
 *   get:
 *     summary: Получение данных конкретного диктанта по ID
 *     tags: [Dictations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID диктанта
 *     responses:
 *       200:
 *         description: Объект диктанта.
 *       404:
 *         description: Диктант не найден.
 *   patch:
 *     summary: Редактирование диктанта (полная замена списка слов)
 *     tags: [Dictations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               language:
 *                 type: string
 *               words:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text: { type: string }
 *                     hint: { type: string }
 *                     audioUrl: { type: string }
 *             required: [title, words]
 *     responses:
 *       200:
 *         description: Диктант обновлен.
 *   delete:
 *     summary: Удаление диктанта
 *     tags: [Dictations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Диктант удален.
 */
router.get('/:id', validate(dictationIdSchema), controller.getOne.bind(controller));
router.patch('/:id', validate(updateDictationSchema), controller.update.bind(controller));
router.delete('/:id', validate(dictationIdSchema), controller.remove.bind(controller));


export default router;