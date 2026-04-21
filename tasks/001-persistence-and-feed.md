# 001 — Сохранение мультиков, лента, лайки, драфты, форки

## Цель

Довести редактор до состояния «пользователь может сохранить мультик (draft локально или published на сервере), посмотреть чужие в ленте с infinite scroll по hot/new/top, лайкнуть, форкнуть и продолжить рисовать».

## Решения по дизайну (кратко)

| Вопрос | Решение | Почему |
|---|---|---|
| Формат исходника (source) | ZIP: PNG на слой/кадр + `manifest.json` | Нужен для draft/edit/fork. Анимированный WebP — это композит без слоёв, его нельзя форкнуть. `jszip` уже в deps. |
| Формат превью | Анимированный WebP + статический thumbnail | Маленький, играет в `<img>`, нативная поддержка. `webp-animation-generator` + `img2webp.wasm` уже в репе. |
| Где кодируем | Web Worker на клиенте | Не блокирует UI, не грузит сервер, уже есть заготовка `web/public/webp/worker.js`. |
| Где хранятся draft'ы | **IndexedDB через `dexie`** (локально у юзера) | `dexie` уже в deps. 90% драфтов никогда не публикуются — нет смысла грузить ими сервер. Юзер не теряет работу оффлайн. Минус: draft не синхронизируется между устройствами (для MVP ок). |
| Где хранятся published | **Локальный диск бэкенда** через абстракцию `storage/*` | Ноль внешних сервисов, 0₽ на старте. Абстракция позволит мигрировать на Cloudflare R2 (S3-API) без переписывания кода, когда упрёмся в один VPS. |
| Клиентский кеш/пагинация лент | **React Query** (`@tanstack/react-query`) | Бесплатно получаем infinite queries, кеш, invalidation, оптимистичные апдейты для лайков. Не надо городить на Recoil. Draft'ы читаем через `dexie-react-hooks` (уже в deps) — реактивно на изменения IndexedDB. |
| Пагинация лент | Cursor | Infinite scroll + offset → дубликаты при вставках. Для top/hot нужны составные курсоры. |
| Hot-score | `log10(likes+1) − ageHours/k`, денормализованный на проекте | Простая рабочая формула. Обновляем cron'ом раз в 10-15 мин для свежих. |
| Лайки | Отдельная коллекция `Like` + `likesCount` на проекте | Unique `(userId, projectId)`, быстрый sort по top. |
| Форк | Копия `source.zip` + `forkedFrom` | Требует source-формат с PNG-sequence (см. выше). |

## Storage-слой на бэкенде

Файлы лежат в `backend/storage/projects/{projectId}/{source.zip|preview.webp|thumb.webp}`. Код обращается через единую абстракцию, чтобы потом без переписывания уйти на R2/S3:

```js
// backend/src/services/storage/index.js
module.exports = {
  put(key, buffer, contentType),     // → void
  get(key),                           // → Readable stream
  delete(key),                        // → void
  exists(key),                        // → boolean
};
```

Две имплементации, выбираемые по `STORAGE_DRIVER` env:
- `local` (default) — пишет в `backend/storage/`
- `s3` — тонкая обёртка над `@aws-sdk/client-s3`, работает с Yandex/R2/любым S3-compatible

Раздача публичных файлов (`preview.webp`, `thumb.webp`) — через `express.static` на `/files/*`. Приватные (`source.zip`) — через auth-gated `GET /api/projects/:id/source` с проверкой владельца/права на форк.

## Data model

### Project (расширение существующей схемы)

```js
{
  owner: ObjectId ref User,        // сейчас String — исправить
  name: String,
  description: String,

  // ключи в storage
  sourceKey: String,               // "projects/{id}/source.zip"
  previewKey: String,              // "projects/{id}/preview.webp" (только published)
  thumbnailKey: String,            // "projects/{id}/thumb.webp" (только published)

  // статусы
  published: Boolean (default false),
  publishedAt: Date (indexed),

  // социалка (денормализация для быстрой сортировки)
  likesCount: Number (default 0, indexed),
  viewsCount: Number (default 0),
  hotScore: Number (indexed),

  // форки
  forkedFrom: ObjectId ref Project (optional, indexed),
  forkCount: Number (default 0),

  // метаданные проекта для ленты (без скачивания zip)
  canvasWidth: Number,
  canvasHeight: Number,
  frameCount: Number,
  fps: Number,
  durationMs: Number,

  createdAt: Date (indexed),
  updatedAt: Date,
}
```

Индексы:
- `{published: 1, createdAt: -1, _id: -1}` — feed new
- `{published: 1, likesCount: -1, _id: -1}` — feed top
- `{published: 1, hotScore: -1, _id: -1}` — feed hot
- `{owner: 1, published: 1, updatedAt: -1}` — my projects (published)
- `{forkedFrom: 1}` — список форков

На бэкенде **нет отдельной модели для draft** — draft'ы живут только в IndexedDB у юзера. На сервер попадает только то, что опубликовано (или то, что юзер явно «запушил на сервер» — если мы когда-нибудь захотим синк драфтов между девайсами, это будет отдельная фича).

### Like (новая коллекция)

```js
{
  userId: ObjectId ref User,
  projectId: ObjectId ref Project,
  createdAt: Date,
}
```

Unique compound index `(userId, projectId)`.

### Dexie (клиент, IndexedDB)

```js
// web/src/modules/db/db.js
const db = new Dexie('flipbook');
db.version(1).stores({
  drafts: '&id, updatedAt, name',  // id = uuid
});
// draft record:
// { id, name, description?, manifest: {...}, sourceBlob: Blob (zip),
//   thumbnailBlob: Blob?, updatedAt, createdAt }
```

При публикации клиент берёт draft из dexie, POSTит на сервер, **оставляет в dexie как «опубликованный локально»** или удаляет — обсудим. Минимальный вариант: удалять после успешной публикации, а дальше draft живёт как серверный published.

## API

```
POST   /api/projects/publish              — multipart: source.zip + preview.webp + thumb.webp + meta
PUT    /api/projects/:id                  — обновить published (правки после публикации)
POST   /api/projects/:id/unpublish        — снять с публикации (оставить source, но не показывать в ленте)
DELETE /api/projects/:id

GET    /api/projects/:id                  — project meta + публичные URL preview/thumb
GET    /api/projects/:id/source           — поток source.zip (auth: owner ИЛИ форк-запрос)

GET    /api/feed?sort=new|top|hot&cursor=<cursor>&limit=24
GET    /api/me/projects?cursor=<cursor>   — только published, т.к. draft'ы в dexie

POST   /api/projects/:id/like
DELETE /api/projects/:id/like

POST   /api/projects/:id/fork             — создаёт draft в dexie у форкера (endpoint возвращает source + meta, клиент кладёт в dexie)
```

### Формат cursor

Base64-encoded JSON `{sortKey, id}`. Клиент не парсит, просто прокидывает обратно. Сервер декодирует и делает `where (sortKey, _id) < (cursor.sortKey, cursor.id) order by sortKey desc, _id desc limit N`.

## Клиент: pipeline публикации

1. User жмёт **Publish** в редакторе.
2. Модалка: name + description.
3. Клиент собирает `source.zip` (PNG per layer per frame + `manifest.json`) → пишет в dexie как latest snapshot.
4. Клиент постит job в Worker: `{frames: ImageBitmap[], fps, size}`.
5. Worker в `web/public/webp/worker.js`:
   - композитит слои в финальные кадры (если ещё не сделано на main-thread),
   - кодирует через `img2webp.wasm` → `Blob(preview.webp)`,
   - берёт первый кадр → `Blob(thumb.webp)`.
6. Основной поток POSTит `source.zip + preview.webp + thumb.webp + meta` на `/api/projects/publish`.
7. Прогресс-бар показывает 3 стадии: Packing → Encoding → Uploading.
8. После успеха — draft в dexie помечается как published (ссылкой на серверный id) или удаляется.

Для **Save draft** — только шаг 3 (сохранение в dexie), без воркера и сети. Мгновенно.

## UI

### Header / routing
- `/` — редактор (new project, draft в dexie автосейвится)
- `/feed/hot`, `/feed/new`, `/feed/top` — ленты
- `/project/:id` — просмотр с плеером + кнопки Like/Fork/Edit (если мой)
- `/editor/:id` — редактирование своего published (fetch source.zip → hydrate) ИЛИ локального draft (из dexie)
- `/editor/draft/:draftId` — редактирование локального draft
- `/me` — My Projects с табами `Published | Drafts`

### Карточка в ленте
Thumbnail (на hover — играет анимированный webp) + name + author + likesCount + кнопка Like.

### Infinite scroll
React Query `useInfiniteQuery` + `IntersectionObserver` на последнем элементе списка → fetch next page. Кеш делает возвращение на ленту из детали мультика моментальным.

### My Projects
- Tab **Published** → `useInfiniteQuery('/api/me/projects')` (React Query)
- Tab **Drafts** → `useLiveQuery(() => db.drafts.orderBy('updatedAt').reverse().toArray())` (dexie-react-hooks, реактивно)

## Безопасность

1. Проверка владельца на всех write-endpoints (`PUT`, `DELETE`, `/unpublish`).
2. `GET /api/projects/:id/source` — auth: owner, либо любой залогиненный (для fork). Published-проект форкается всеми; draft'а на сервере вообще нет.
3. Валидация upload'ов: MIME, размер (source ≤ 20MB, preview ≤ 10MB, thumb ≤ 500KB), структура zip (внутри только `.png` и `manifest.json`).
4. Rate limiting на `/publish` и `/like`.
5. Санитизация `name`/`description` (длина + trim + отсутствие HTML).

## План реализации (подзадачи)

### Минимальный замкнутый слайс (после этого уже можно тестировать e2e на себе):

- [ ] **1.1** Storage-слой на бэкенде: `backend/src/services/storage/` с драйверами `local` и `s3`, env `STORAGE_DRIVER=local` (default). Удалить хардкод ключей из `routes/api/projects.js`.
- [ ] **1.2** Расширить модель `Project` под новую схему, удалить `draft`/`movie` поля (переходим на `sourceKey`/`previewKey`/`thumbnailKey`). Создать модель `Like`. Миграция не нужна — существующие записи можно дропнуть (данных нет).
- [ ] **1.3** Клиент: модуль `web/src/modules/db/db.js` (Dexie) со схемой `drafts`. Автосейв draft'а при изменениях редактора (debounced). Удалить/заменить существующий код сохранения в бэкенд в Editor.jsx.
- [ ] **1.4** Клиент: WebP pipeline — доделать `web/public/webp/worker.js` + обвязка `useWebpEncoder` hook с progress. Интегрировать с Konva-рендером в `Editor.utils.js::makeMovie` (сейчас не работает).
- [ ] **1.5** Бэкенд: `POST /api/projects/publish` (multipart, source+preview+thumb+meta). Клиентский Publish flow с модалкой и прогрессом 3 стадий.
- [ ] **1.6** Бэкенд: `GET /api/projects/:id` + `GET /api/projects/:id/source` (auth-gated stream). Клиент: страница `/project/:id` с плеером (просто `<img src={previewUrl}>`). Страница `/editor/:id` для редактирования своего published — fetch source → unpack → hydrate Recoil state.

### Соц. слой:

- [ ] **1.7** Feed endpoint `GET /api/feed?sort=new|top` с cursor-пагинацией. UI `/feed/new` и `/feed/top` с React Query `useInfiniteQuery` + IntersectionObserver. Удалить копипасту из `Feed.jsx`.
- [ ] **1.8** Like endpoints + UI кнопки на карточке и странице просмотра. React Query optimistic update.
- [ ] **1.9** `hotScore` поле + cron-сервис для пересчёта свежих проектов (раз в 10 мин, проекты опубликованные за последние 7 дней) + `/feed/hot`.
- [ ] **1.10** Fork: `POST /api/projects/:id/fork` возвращает source.zip + метаданные, клиент создаёт новый draft в dexie со ссылкой `forkedFrom`. В карточке проекта показывать «Forked from @user» со ссылкой, если `forkedFrom` задан.
- [ ] **1.11** `/me` страница с табами Published (React Query) / Drafts (dexie-react-hooks).

### Зависимости для установки

- `yarn add @tanstack/react-query` (web)
- `yarn add dexie-react-hooks` — уже в deps, проверить что подхватится
- `yarn add multer @aws-sdk/client-s3` (backend) — multer уже есть; `@aws-sdk/client-s3` нужен только когда переключимся с `local` на `s3`, можно пока не ставить

## Открытые вопросы

- **Hot-формула**: коэффициент `k` подбираем на живых данных.
- **Модерация**: на MVP не делаем, резервируем поле `status: 'active' | 'hidden' | 'removed'` в Project.
- **Просмотры**: инкрементить `viewsCount` при просмотре страницы проекта? Поле зарезервируем, реализация — когда понадобится.
- **Тематические недели/челленджи**: вне скоупа этой таски — будет отдельная 002.
- **Синк драфтов между устройствами**: не делаем. Если понадобится — отдельная фича «Push draft to server».

## Оценка

Слайс 1.1-1.6 (сохранение + публикация + просмотр + редактирование published без ленты) — ~1 неделя.
Соц. слой 1.7-1.11 — ~1-1.5 недели.
Итого на всё — **2-3 недели** одному.
