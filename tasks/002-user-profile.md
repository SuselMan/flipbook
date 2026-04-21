# 002 — Профиль пользователя и кастомизация

## Цель

Публичный профиль `/user/:username` с аватаркой, био, списком мультиков и агрегированным рейтингом. Автор на карточке в ленте — кликабельный.

## Data model

### User (расширение)

Текущая модель хранит только email/password/provider/role. Добавить:

```js
{
  ...existing,
  username: String,                    // REQUIRED, unique, slug-safe, 3-32 chars, lowercase
  displayName: String,                 // max 50, что угодно
  bio: String,                         // max 200, plain text, без line breaks и HTML
  avatarKey: String,                   // ключ в storage
  country: String,                     // ISO 3166-1 alpha-2 (RU, US, DE, ...), optional
  countryChangedAt: Date,              // для rate-limit смены страны
  karma: Number,                       // денормализованная сумма likesCount по всем published
  publishedCount: Number,              // денормализация
  createdAt: Date,                     // уже есть
}
```

Индекс `{username: 1}` unique, collation strength 2 (case-insensitive). Индекс `{karma: -1}` для глобального лидерборда. Индекс `{country: 1, karma: -1}` для странового.

### Karma

- Сумма `likesCount` по published проектам. Пересчитывается тем же cron'ом, что и `hotScore` (раз в 10 мин).
- **Не уменьшается** при удалении проектов/лайков — принимаем риск фрода для простоты v1.
- Видна всем на шапке профиля.

Badges — отдельная задача, в v1 не делаем.

### Страна

`country` — ISO 3166-1 alpha-2. **Не обязательное поле**, но сильно подсвечено при регистрации.

На проекте при publish **денормализуем** `ownerCountry` — чтобы фильтровать ленту без join'а:

```js
// Project
ownerCountry: String,   // копируется с User.country в момент publish, nullable
```

Если юзер меняет страну потом — старые проекты не трогаем (прошлая страна остаётся на прошлых проектах).

**Rate limit смены страны**: 1 раз в 7 дней. Проверяется на бэке через `countryChangedAt`. Клиент дизейблит селектор с сообщением «Next change available in N days».

**Флаг страны видят все** (нет опции скрыть — упростили). Если у юзера страна не выбрана — флага нет.

**EU/NA/региональные уровни** — не делаем, только страна или глобал.

## Username

- **Обязательное при регистрации**. Форма регистрации: email + username + password + password repeat.
- Формат: `^[a-z0-9_-]{3,32}$`, lowercase-нормализованный на бэке.
- Валидация unique на бэке. На клиенте — debounced `GET /api/users/check-username?u=...` для realtime-фидбека.
- Дефолт-подсказка в форме: `user_<8-char-hex>` (не от email — тогда email утекает через username).
- **Сменить username нельзя в v1** — не делаем, никакого рейт-лимита и истории резервирования не нужно.

## Аватарка

- Storage-слой (как source.zip): `avatars/{userId}/avatar.webp`.
- Max 500 KB, квадрат 256×256, webp. Resize на клиенте до аплоада.
- Если не загружена — клиент рендерит дефолт: круг с инициалами displayName (canvas API, цвет — hash от username).

## API

```
GET    /api/users/:username            — публичный профиль (meta + karma + count)
GET    /api/users/:username/projects   — published проекты этого автора (cursor)
GET    /api/users/check-username?u=... — свободен ли username, { available: bool }
PATCH  /api/me                         — обновить (displayName, bio, country) — username/email не меняем
POST   /api/me/avatar                  — multipart webp
DELETE /api/me/avatar
```

Lookup по `username` — case-insensitive (Mongo collation strength 2), сохранение — lowercase.

Валидации:
- `username` — `/^[a-z0-9_-]{3,32}$/`, обязательное в register.
- `displayName` — trim, no HTML, max 50.
- `bio` — trim, `\r\n` заменяется на пробел, max 200, no HTML.
- `country` — whitelist ISO codes, rate-limit 7 дней.
- `avatar` — MIME=image/webp, ≤500KB.

### Feed с фильтром по стране

Расширяем feed endpoint из 001:

```
GET /api/feed?sort=new|top|hot&cursor=&limit=&scope=global|country
```

- `scope=global` (по умолчанию) — как сейчас.
- `scope=country` — требует аутентификации + `user.country` задан; фильтрует `ownerCountry === req.user.country`. Если нет страны — fallback на global + баннер «Set your country to see local feed».

Клиент React Query key: `['feed', sort, scope]` — отдельный кеш на каждую комбинацию.

## UI

- `/user/:username` — страница профиля.
  - Шапка: avatar (128px), displayName, @username, 🇷🇺 флаг (если есть), bio, karma, join date.
  - Табы: `Projects` (по умолчанию). `Liked` — **убрали**, публично не показываем что юзер лайкал; только общее число лайков у него в шапке опционально.
  - Карточки те же что в feed.
- `/me/settings` — форма редактирования (displayName, bio, avatar, country).
  - Country — searchable dropdown с флагами (`i18n-iso-countries` + `country-flag-icons`). Дизейблится если менял недавно.
  - Username и email — read-only (менять нельзя в v1).
- **Регистрация** (`Register.jsx`): добавить поле `username` как обязательное + realtime-проверку доступности. `country` — опциональный селектор, pre-filled по `Intl.DateTimeFormat().resolvedOptions().timeZone`.
- **Feed**: переключатель `Global | My country` рядом с вкладками Hot/New/Top. Если у юзера нет страны — «My country» показывает CTA «Set country» со ссылкой в настройки.
- **MyProjects.jsx** сверху — строка с мини-аватаркой, username, ссылкой «Edit profile».
- **Карточка в ленте**: под названием мультика — кликабельное `@username` + флаг страны.

## Связанные изменения

- `toPublicProject` возвращает `author: {id, username, displayName, avatarUrl, country}` вместо сырого `owner: ObjectId`.
- Регистрация без email-подтверждения (уже упрощено в 001) — юзер сразу логинится, заполнив username + email + password.
- Старую тестовую базу дропаем при развёртывании этой задачи (нет миграции существующих юзеров без username).

## Анонимная публикация

Отдельная задача — **011-anonymous-publish.md**. Юзер может опубликовать без регистрации, указав «display name» одноразово. При нажатии Save ему предлагается «зарегистрируйся чтобы не потерять мультик» с сохранением текущего draft'а.

## Открытые вопросы

- Префикс `user_` в дефолтном username — возможно, лучше просто 8 случайных символов без префикса, чтобы не палить что это дефолт? Обсуждаемо.
- Генерация дефолтной аватарки: цвет-хэш от username или от userId? Username стабильнее для UX (переустановил/перелогин → тот же цвет).
- **Following** / подписки — не в этой задаче, отдельная большая фича позже.
- Badges — отдельная задача после v1.
