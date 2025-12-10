// src/routes/wordRoutes.ts
import { Router } from 'express';
import { WordController } from '../controllers/wordController';
import { authMiddleware } from '../middlewares/authMiddleware'; // Импорт

const router = Router();
const controller = new WordController();

// src/routes/wordRoutes.ts
// ...
/**
 * @swagger
 * /words:
 *   post:
 *     summary: Добавление нового слова в диктант
 *     tags: [Words]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: Phenomenon
 *               dictationId:
 *                 type: integer
 *                 example: 5
 *               hint:
 *                 type: string
 *                 example: Необычное явление (опционально)
 *               audioUrl:
 *                 type: string
 *                 example: /uploads/custom_audio.mp3 (опционально)
 *     responses:
 *       201:
 *         description: Слово успешно добавлено.
 *       400:
 *         description: Отсутствует текст или ID диктанта.
 * 
 *   get:
 *     summary: Получение всех слов в системе (для режима "Тренировать всё подряд")
 *     tags: [Words]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Список всех слов в системе.
 */
router.post('/', authMiddleware, controller.create.bind(controller)); 

router.get('/', controller.getAll.bind(controller));


// src/routes/wordRoutes.ts
// ...
/**
 * @swagger
 * /words/{id}:
 *   delete:
 *     summary: Удаление слова по ID
 *     tags: [Words]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID слова для удаления
 *     responses:
 *       200:
 *         description: Слово успешно удалено.
 *       403:
 *         description: Нет прав для удаления (не твое слово).
 *       404:
 *         description: Слово не найдено.
 */

router.delete('/:id', authMiddleware, controller.delete.bind(controller)); // :id означает, что ID будет в адресе
export default router;