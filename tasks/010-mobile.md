# 010 — Мобильная / планшетная версия

## Главный вопрос: отдельное приложение или адаптивная вёрстка?

### Аудитория

Ключевой юзер для flipbook-редактора — **подросток/студент с iPad или Android-планшетом со стилусом**. Desktop — вторичен (это не Photoshop, рисовать мышкой неудобно). Телефон — третичен (очень мелкий canvas, но для просмотра ленты и лайков OK).

### Варианты

| Подход | Плюсы | Минусы |
|---|---|---|
| **Responsive web** | Один кодбейз, мгновенный доступ по URL, нет ревью App Store. Konva умеет touch + pointer events. | Без нативного app нет «install» в home screen без плясок, нет стилус-API (Apple Pencil pressure — доступно только через JS-API). |
| **PWA** | Та же веб-версия + install prompt + offline кеш + splash screen. | iOS PWA ограниченный: нельзя получить push-нотификации (до iOS 16.4 в home screen), стилус-давление работает через PointerEvent. |
| **Native iOS/Android** | Лучшая производительность, полный стилус API, в App Store → легче монетизировать. | Два кодбейза (Swift/Kotlin) или React Native → три платформы кода. Ревью App Store. Платёжки 30% Apple tax. |
| **Capacitor/Tauri wrap** | Оборачиваем web → native binary. Компромисс. | 30% tax всё равно, если платежи через Apple. |

### Рекомендация

**Phase 1 (сейчас):** adaptive responsive + PWA. Это 80% value за 20% стоимости.

**Phase 2:** если retention хороший и есть запрос от ЦА — обернуть в Capacitor для App Store / Google Play, даст install count + push-нотификации. Платежи держать на web/Stripe (через веб-подписку, минуя Apple tax).

## Phase 1 план

### Вёрстка

- Breakpoints: `mobile < 768px`, `tablet 768-1200px`, `desktop > 1200px`.
- Editor layout:
  - **Desktop** (текущий): левая панель инструментов, правая панель кисти/слоёв, холст центр, timeline внизу.
  - **Tablet landscape**: левая панель тоньше, timeline внизу, layers в выдвижной панели справа.
  - **Tablet portrait / phone**: все панели — bottom sheet'ы / toggles. Холст на весь экран. Floating action button (FAB) для открытия tools.
- Feed / Project / MyProjects — грид меньше колонок, карточки шире.

### Touch

- Canvas.jsx использует pointer events — это универсально (mouse, touch, stylus).
- Проверить:
  - `touch-action: none` на canvas (чтобы не скроллило страницу при рисовании).
  - `pointerrawupdate` для плавности (высокая частота).
  - `e.pressure` для стилус-давления → маппить в opacity или brush size.
  - Multi-touch pinch-zoom на canvas (собирать 2 pointer events, считать distance).
- Отключить контекстное меню long-press.

### Stylus

- Apple Pencil / Android S Pen через PointerEvent: `pointerType === 'pen'`, `pressure [0..1]`, `tiltX/Y`. Без jailbreak работает.
- Palm rejection: игнорировать `pointerType === 'touch'` когда активен `pen`.

### PWA

- Добавить `web/public/manifest.json` с иконками, theme_color, display:standalone.
- `service-worker.js` — кешировать static assets, fallback offline для уже открытых draft'ов (работают из IndexedDB).
- Meta `apple-touch-icon`, `apple-mobile-web-app-capable` для iOS.

### Тестирование

- Реальные девайсы: iPad + Android планшет + iPhone SE. Без этого — слепая работа.
- Chrome DevTools device emulator — норм для вёрстки, плох для touch нюансов.

## Phase 2 (если идём в нативку)

- Capacitor wrap. WebView отображает то же самое, но даёт:
  - Install в App Store / Play Store.
  - Deep linking.
  - Push-нотификации (OneSignal / Firebase).
  - Share sheet.
- Платежи: web flow Stripe через browser (нелегально по ToS Apple для «digital content», но можно через Apple IAP + serverside sync).

## Объём

- Phase 1 responsive: 1-2 недели полного времени после того как обычный UI доделан.
- PWA: +1-2 дня.
- Phase 2 (Capacitor + store submission): +2-3 недели, включая ревью.

## Открытые вопросы

- **Offline-рисование**: Draft'ы уже в IndexedDB. Publish требует сеть. В offline показывать баннер «Offline, draft saved locally, publish when online».
- **Экспорт в галерею устройства** — через Web Share API (share image file). iOS Safari поддерживает.
- **Canvas размер** подстраивать под viewport или фиксировать? Фиксировать внутренний (1024×600), CSS-scale до viewport. Чтобы при публикации все мультики были в одном разрешении.
