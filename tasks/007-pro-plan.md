# 007 — Монетизация: Pro plan

## Скоуп решения

Подписочная модель с ценой примерно $4-5/мес или $40/год. Бесплатный тариф остаётся функциональным, чтобы не отталкивать коммьюнити (это ключевой актив).

## Как делим фичи

### Free

- До **3 слоёв**, до **30 кадров**, палитра 16 цветов
- Canvas 1024×600, экспорт WebP
- Публикация с watermark `Made with Flipbook` в углу preview (watermark можно убрать в Pro)
- Drafts живут только локально (IndexedDB)

### Pro

- Неограниченно слоёв и кадров
- Полная палитра + custom color picker
- Canvas размером до 2048×1200 (HD)
- Экспорт WebP + **MP4/GIF** (mp4 через ffmpeg.wasm или просто через WebCodecs API)
- Без watermark
- **Синк драфтов между устройствами** (draft пишется и в IndexedDB и на сервер)
- **Приватные проекты** — черновики и unpublished хранятся на сервере, доступ только автору
- Приоритетная помощь и раннее превью новых фич

### Что НЕ делать в Pro:

- Не манипулировать рейтингом (Pro не должно увеличивать шанс попасть в Hot).
- Не гейтить челленджи.

## Платёжный провайдер

- **Lemon Squeezy** или **Paddle** — merchant-of-record, сами заботятся о НДС в ЕС, проще чем чистый Stripe (особенно для РФ-аудитории с ограничениями).
- **YooKassa** — если целимся в РФ и нужна карта РФ.
- **Stripe** — классика, но нужен свой VAT/GST mess.

Рекомендация: начать с Lemon Squeezy. Если аудитория из РФ большая, добавить YooKassa как второй провайдер (на бэке абстракция `PaymentProvider`).

## Data model

### User (расширение)

```js
{
  subscriptionTier: 'free' | 'pro',
  subscriptionStatus: 'active' | 'past_due' | 'canceled' | null,
  subscriptionCurrentPeriodEnd: Date,
  subscriptionProviderId: String,       // id в LemonSqueezy/YooKassa
}
```

### Subscription (для истории)

```js
{
  userId,
  tier,
  provider,
  providerSubscriptionId,
  startedAt,
  endedAt,
  events: [{type, at, payload}],         // webhook history
}
```

## API

```
GET    /api/me/subscription              — текущий статус
POST   /api/billing/checkout             — создать checkout-сессию у провайдера, вернуть redirect URL
POST   /api/billing/webhook               — эндпоинт для провайдера (signature verification)
POST   /api/me/subscription/cancel       — отменить в конце периода
```

Feature-flag хелпер:
```js
export const canUseFeature = (user, feature) => ...
// features: 'unlimited-layers', 'hd-canvas', 'mp4-export', 'no-watermark', 'draft-sync', 'private-projects'
```

## Frontend

- Landing `/pricing`: сравнение free vs pro, кнопка Subscribe.
- В редакторе — если юзер пытается добавить 4-й слой на free → модалка «Upgrade to Pro для неограниченного числа слоёв» с кнопкой.
- В хедере (для Pro) — значок Pro рядом с username.
- Settings page `/me/billing` — статус, отмена.

## Упомянутый watermark

При publish:
- Если free: дорисовываем на `preview.webp` в compositing'е текст `flipbook.app` в правом нижнем углу, opacity 0.6.
- Если pro: не дорисовываем.

## Открытые вопросы

- **Ценовая точка**: $5/мес может быть много для школьников (основной ЦА FlipAnim-подобного продукта). Может $3/мес + $25/год? Или $2.99/мес? Проверим на paywall-тестах.
- **Student discount** 50% при загрузке студ. билета — хорошо для PR, плохо для фрода. На MVP пропустить.
- **Lifetime deal** при раннем запуске ($79 one-time) — классика для early adopters. Подумать.
- **Gift subscriptions** — потом.
