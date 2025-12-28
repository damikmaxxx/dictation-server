import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validate'; 
import { registerSchema, loginSchema } from '../dtos/auth.schema';
const router = Router();
const controller = new AuthController();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: newuser@example.com
 *               password:
 *                 type: string
 *                 example: mySecretPassword123
 *               name:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован. Возвращает токен.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Ошибка валидации (например, email уже существует).
 */
router.post('/register', validate(registerSchema), controller.register.bind(controller));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Вход пользователя (логин)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: mySecretPassword123
 *     responses:
 *       200:
 *         description: Успешный вход. Возвращает токен для дальнейших запросов.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Неверный логин или пароль.
 */

router.post('/login', validate(loginSchema), controller.login.bind(controller));


/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Получение данных текущего пользователя по JWT-токену
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Объекта пользователя (без пароля).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: Не авторизован (токен недействителен или отсутствует).
 *       404:
 *         description: Пользователь не найден.
 */
router.get('/me', authMiddleware, controller.getMe.bind(controller)); 



/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Получение нового Access Token. Использует Refresh Token из HTTP-Only Cookie.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Новый Access Token возвращен, а новый Refresh Token установлен в Cookie.
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: refreshToken=новый_токен; HttpOnly; Max-Age=2592000
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: Короткоживущий токен для API-запросов.
 *       401:
 *         description: Refresh Token недействителен, просрочен или украден (токен отозван).
 */

router.post('/refresh', controller.refresh.bind(controller));

export default router;