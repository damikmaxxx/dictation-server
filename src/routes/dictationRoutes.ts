import { Router } from 'express';
import { DictationController } from '../controllers/dictationController';
import { authMiddleware } from '../middlewares/authMiddleware';

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
 *                 description: Полный новый список слов (массив объектов)
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                       example: Phenomenon
 *                     hint:
 *                       type: string
 *                       example: Явление (опционально)
 *                     audioUrl:
 *                       type: string
 *                       example: /uploads/tts-123.mp3 (опционально)
 *             required: [title, words]
 *     responses:
 *       201:
 *         description: Диктант успешно создан.
 *       401:
 *         description: Не авторизован (нет токена).
 * /dictations/{id}:
 *   get:
 *     summary: Получение данных конкретного диктанта по ID (для режима Play)
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
 *         description: Объекта диктанта со списком слов.
 *       404:
 *         description: Диктант не найден.
 *   patch:
 *     summary: Редактирование диктанта (названия, описания, слов, языка)
 *     tags: [Dictations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID диктанта для редактирования
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Новые сложные слова
 *               description:
 *                 type: string
 *                 example: Обновленное описание (опционально)
 *               language:
 *                 type: string
 *                 example: en
 *               words:
 *                 type: array
 *                 description: Полный новый список слов (массив строк) для замены.
 *                 items:
 *                   type: string
 *                   example: phenomenon
 *             required: [title, words]
 *     responses:
 *       200:
 *         description: Диктант успешно обновлен.
 *       403:
 *         description: Нет прав (не является владельцем).
 *       404:
 *         description: Диктант не найден.
 *   delete:
 *     summary: Удаление диктанта по ID (удаляет также все слова и результаты)
 *     tags: [Dictations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID диктанта для удаления
 *     responses:
 *       200:
 *         description: Диктант успешно удален.
 *       403:
 *         description: Нет прав (не является владельцем).
 *       404:
 *         description: Диктант не найден.
 */
router.post('/', controller.createWithWords.bind(controller));
router.post('/complete', controller.complete.bind(controller));
router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getOne.bind(controller));
router.patch('/:id', controller.update.bind(controller));
router.delete('/:id', controller.remove.bind(controller));

export default router;