import { Router } from 'express';
import { upload } from '../middlewares/uploadMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// src/routes/uploadRoutes.ts
// ...
/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Загрузка аудио или изображения на сервер
 *     tags: [Upload]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Файл (MP3, WAV, JPG, PNG).
 *     responses:
 *       200:
 *         description: Файл успешно загружен.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: /uploads/audio-167888123.mp3
 *       400:
 *         description: Файл не загружен или неверный формат.
 */
router.post('/', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  res.json({ url: fileUrl });
});

export default router;