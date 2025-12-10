# Dockerfile

# --- STAGE 1: BUILD (Сборка) ---
# Берем официальный образ Node.js для сборки
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
# Используем --production=false, чтобы установить и dev-зависимости (для tsc)
RUN npm install --production=false

# Копируем исходный код
COPY . .

# Компилируем TypeScript в JavaScript
RUN npm run build


# --- STAGE 2: PRODUCTION (Запуск) ---
# Берем чистый, легкий образ (только для запуска)
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем только runtime-зависимости (без dev-зависимостей)
COPY package*.json ./
RUN npm install --only=production

# Копируем скомпилированный JS-код из фазы BUILD
COPY --from=builder /app/dist ./dist

# Открываем порт
EXPOSE 5000

# Задаем команду запуска
CMD ["npm", "start"]