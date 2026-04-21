# 006 — Комментарии к мультикам

## Data model

### Comment

```js
{
  id,
  projectId: ObjectId (ref Project, indexed),
  userId: ObjectId (ref User),
  text: String,            // max 500, trim, no raw HTML
  parentId: ObjectId | null,  // для тредов (одноуровневых — без бесконечной вложенности)
  likesCount: Number,      // опционально, потом
  createdAt: Date,
  updatedAt: Date,
  status: 'active' | 'hidden' | 'removed',
}
```

Индексы: `{projectId: 1, createdAt: -1}`, `{parentId: 1}`.

## API

```
GET    /api/projects/:id/comments?cursor  — top-level + first-page replies, cursor
POST   /api/projects/:id/comments          — создать (auth, rate-limited)
DELETE /api/comments/:id                    — автор или admin
POST   /api/comments/:id/report             — жалоба
```

- `GET` возвращает top-level + до 3 ответов на каждый + `hasMoreReplies`.
- Для "load more replies" — отдельный `GET /api/comments/:id/replies?cursor`.

## UI

- На `/project/:id` ниже превью — секция Comments.
- Форма: textarea + Post. Для незалогиненных — "Sign in to comment".
- Каждый коммент: avatar @username · relative time · text · Reply · Delete (если свой).
- Реплаи inline, но только 1 уровень (Reddit-style без глубокой вложенности, чтобы не городить отступы на мобилке).
- React Query `useInfiniteQuery` для пагинации.
- Оптимистичный POST: комментарий появляется мгновенно с пометкой `(sending…)`.

## Модерация (минимум)

- `POST /api/comments/:id/report` — пишет в отдельную коллекцию `Reports`. Админ видит их в `/admin/reports`.
- Автор проекта может **скрыть** коммент у себя на странице (status='hidden'), как минимум без удаления.
- Rate-limit на создание: 10 комментов в 5 минут на юзера.

## Уведомления (опционально, позже)

- «Юзер X прокомментировал ваш мультик» — коллекция `Notifications`, иконка колокольчика.
- Пока не делаем — в MVP достаточно просто показывать комменты.

## Анти-спам

- Обязательно залогин для пост.
- Content-based: простой список запрещённых слов. Не сильное.
- Уровень аккаунта: юзер должен быть зареган >24ч и иметь подтверждённый email — **но мы отключили подтверждение** (см. 001 decision). Значит, первый барьер — только капча при N-й жалобе. Отложим.

## Открытые вопросы

- Отмечать мнение автора проекта визуально (OP). Да, бейдж.
- Пинг `@username` в комментах — v2, отдельная задача.
- Markdown в комментах — нет, только plain text. Ломать хайп с экранированием ни к чему.
