# GameHub

Веб-приложение игровой платформы, разработанное в рамках выпускной квалификационной работы.

Проект состоит из frontend-части на React и TypeScript и backend-части на Node.js, Express и PostgreSQL.

## Возможности

* регистрация и авторизация пользователей;
* каталог игр;
* поиск и фильтрация;
* страницы игр;
* покупка игр и библиотека пользователя;
* рекомендации;
* профиль пользователя;
* группы и публикации;
* поиск пользователей и добавление в друзья.

## Стек

**Frontend:** React, TypeScript, Vite, CSS
**Backend:** Node.js, Express, TypeScript
**Database:** PostgreSQL
**API:** REST
**Авторизация:** JWT, bcrypt

## Структура frontend

```text
src/
├── app/
├── entities/
├── features/
├── pages/
├── shared/
└── widgets/
```

Frontend разделён на слои по принципам Feature-Sliced Design.

## Структура backend

```text
server/src/
├── config/
├── db/
├── middleware/
└── modules/
```

Backend разделён на модули для работы с авторизацией, играми, библиотекой, покупками, отзывами, рекомендациями, профилем, группами и друзьями.

## Локальный запуск

### Требования

* Node.js
* npm
* PostgreSQL

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd server
npm install
```

Создайте `.env` на основе `.env.example`.

```bash
npm run db:schema
npm run db:seed
npm run dev
```

По умолчанию:

* frontend: `http://localhost:5173`
* API: `http://localhost:4000/api`

## Переменные окружения

| Переменная       | Назначение                      |
| ---------------- | ------------------------------- |
| `DATABASE_URL`   | строка подключения к PostgreSQL |
| `JWT_SECRET`     | секретный ключ для JWT          |
| `JWT_EXPIRES_IN` | срок действия JWT               |
| `API_PORT`       | порт backend                    |
| `CLIENT_PORT`    | порт frontend                   |
| `CLIENT_ORIGIN`  | разрешённые origin для CORS     |
