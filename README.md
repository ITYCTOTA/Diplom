# GameHub

Веб-приложение игровой платформы, разработанное в рамках выпускной квалификационной работы.

Проект состоит из frontend-части на React и TypeScript и backend-части на Node.js, Express и PostgreSQL.

<img width="2100" height="978" alt="Главная страница GameHub" src="https://github.com/user-attachments/assets/632af3a8-bf08-4ee7-be5f-65565d9f219e" />
<img width="2109" height="973" alt="Каталог игр GameHub" src="https://github.com/user-attachments/assets/507e9270-cdc4-4af3-989b-61e9d5d30492" />
<img width="2101" height="907" alt="Страница профиля GameHub" src="https://github.com/user-attachments/assets/b6202b4b-613b-4e30-adf2-020a433d57fe" />

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

Создайте файл `.env` в корне проекта на основе `.env.example`.

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
| `VITE_API_URL`   | адрес API для frontend          |
| `DATABASE_URL`   | строка подключения к PostgreSQL |
| `JWT_SECRET`     | секретный ключ для JWT          |
| `JWT_EXPIRES_IN` | срок действия JWT               |
| `API_PORT`       | порт backend                    |
| `CLIENT_PORT`    | порт frontend                   |
| `CLIENT_ORIGIN`  | разрешённые origin для CORS     |
