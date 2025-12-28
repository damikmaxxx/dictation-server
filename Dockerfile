# 1. ФАЗА СБОРКИ
# Используем slim (Debian) вместо alpine
FROM node:20-slim AS builder

WORKDIR /app

# Устанавливаем OpenSSL (в Debian это делается через apt-get)
RUN apt-get update -y && apt-get install -y openssl

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
# Генерируем клиент. Теперь он скачает правильный движок для Debian
RUN npx prisma generate

COPY . .
RUN npm run build
RUN npm prune --production

# 2. ФАЗА ПРОДАКШЕНА
FROM node:20-slim AS production

# Тоже устанавливаем OpenSSL для запуска
RUN apt-get update -y && apt-get install -y openssl ca-certificates

WORKDIR /app

COPY package.json ./

# Копируем всё из билдера
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 80

CMD ["sh", "-c", "npx prisma db push && node dist/server.js" ]