# 005 — Еженедельные челленджи

## Цель

Дать пользователям «повод рисовать на этой неделе». Повышает retention и создаёт сообщество вокруг общих тем.

## Поведенческий дизайн (что будет двигать юзера)

- **Чёткий дедлайн** — «Ends in 3d 14h». Лосс-авершн сильнее награды.
- **Визибилити результата** — свой мультик попадает в общий пул под темой, юзеры видят работы друг друга.
- **Соревновательность** — топ-3 недели получают бэйджи (постоянные) + неделю Pro-фичей бесплатно.
- **Лёгкий вход** — тема должна быть простой для 1-часового скетча, не эпическая.

## Data model

### Challenge

```js
{
  id,
  theme: String,                  // "Draw a dog"
  description: String,            // длинное, с примерами
  startDate: Date,                // сб 00:00 UTC
  endDate: Date,                  // следующая сб 00:00 UTC
  status: 'upcoming' | 'active' | 'ended',
  submissionsCount: Number,
  winnerProjectIds: [ObjectId],   // заполняется при endDate
  createdAt: Date,
}
```

Индекс `{status: 1, endDate: 1}`.

### Project (добавить поле)

```js
challengeId: ObjectId (ref Challenge, optional, indexed),
```

## API

```
GET    /api/challenges/current               — активный челлендж
GET    /api/challenges                        — список (упрощённо, cursor)
GET    /api/challenges/:id                    — детали + winners
GET    /api/challenges/:id/projects           — cursor, sort=hot|new|top в рамках челленджа
POST   /api/admin/challenges                  — создать (role: admin)
```

Клиент при publish может добавить `challengeId` если темы — нужна галочка в модалке.

## Автоматизация (cron)

- Каждый час:
  - Найти `status=upcoming` с `startDate <= now` → `active`.
  - Найти `status=active` с `endDate <= now` → `ended` + вычислить winnerProjectIds (top 3 по likesCount в рамках challenge).
- Раз в неделю в воскресенье 03:00 UTC: создать следующий upcoming, если очередь пустая (из `configs/weeklyThemes.js` выбираем по индексу).

Плюс админская кнопка «reroll / skip theme».

## Награды

- Победителям — permanent badge `"Dog Week Winner 2026-W17"` в профиле.
- Топ-10 — badge `"Dog Week Top 10"`.
- Всем участникам — `participation` badge с темой (не отображается по умолчанию, только в полном списке).
- Топ-3 получают 7 дней Pro бесплатно (когда Pro появится, см. 007).

## UI

- **Home / Hot feed**: баннер сверху — «This week: Draw a dog. 3d 14h left. 47 submissions.» Клик — страница челленджа.
- **Challenge page** `/c/:slug`: описание + feed проектов с тегом + кнопка «Submit your take».
- **Editor publish modal**: чекбокс «Submit to this week's challenge: Dog Week». Автоматически тегирует при publish.
- **Profile**: в badges показать бейджи победителя/участника.

## Исторически: темы

Файл `backend/src/configs/weeklyThemes.js` — список из 52+ идей. Можно подтянуть из списка reddit's r/sketchdaily или придумать самим. Примеры: Dog, Coffee, Monster, Mirror, City, Ghost, Dream.

## Открытые вопросы

- **Участвовать в челлендже можно только одним мультиком или несколькими?** Предложение: одним per user per challenge. Менять можно до конца недели.
- **Можно ли форкнуть чужой мультик и отправить как свой в челлендж?** Да — но с явной пометкой `forkedFrom` на карточке.
- **Фрод**: юзер делает N аккаунтов и лайкает свой. Начнём с IP-rate limiting на лайки, потом можно добавить «confidence score» на лайк (старые аккаунты важнее).
- Пока нет мобилы (см. 010) и UI-перевода (см. 009) — темы только по-английски.
