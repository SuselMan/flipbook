# 004 — Хоткеи и их настройка

## Текущее состояние

В репе уже есть `web/src/modules/Shortcuts/Shortcuts.js` + `web/src/configs/shortcuts.js`. В `Editor.jsx` строки 170-184 — всё закомментировано. Очевидно кто-то начал, но не докрутил.

## Минимум

1. Восстановить и починить `Shortcuts.on(SHORTCUTS.ACTION, handler)` — раскомментировать/переписать.
2. Дефолты:
   - `Ctrl+Z` — Undo
   - `Ctrl+Shift+Z` / `Ctrl+Y` — Redo
   - `B` — Brush
   - `E` — Eraser
   - `Space` — Play/Pause
   - `←` / `→` — Previous/Next frame
   - `O` — Onion skin toggle
   - `Delete` — Delete frame
   - `Ctrl+D` — Duplicate frame
   - `N` — New frame
   - `L` — New layer
   - `[` / `]` — Decrease/Increase brush size

Mac: `Cmd` вместо `Ctrl` (через `e.metaKey`).

## UI настройки

`/settings/hotkeys` — список всех действий с текущей привязкой. Клик по привязке → «Press new shortcut…» → захватываем следующий `keydown`, валидируем конфликты, сохраняем.

Состояние — `localStorage['hotkeys'] = {actionId: ['Ctrl+Z', ...]}`. Дефолты из `configs/shortcuts.js`, перекрываются пользовательскими.

## Архитектура

```js
// web/src/modules/Shortcuts/Shortcuts.js
const registry = new Map();       // action -> handler
const bindings = new Map();       // keyCombo string -> action

export const on = (action, handler) => registry.set(action, handler);
export const off = (action) => registry.delete(action);
export const bind = (action, combo) => bindings.set(combo, action);
export const unbind = (combo) => bindings.delete(combo);

document.addEventListener('keydown', (e) => {
  if (e.target.matches('input, textarea, [contenteditable]')) return;
  const combo = keyComboFromEvent(e);          // 'Ctrl+Shift+Z'
  const action = bindings.get(combo);
  const handler = action && registry.get(action);
  if (handler) { e.preventDefault(); handler(e); }
});
```

`Editor.jsx` в mount:
```js
Shortcuts.on('undo', undo);
Shortcuts.on('redo', redo);
Shortcuts.on('playPause', togglePlay);
...
```

В unmount — off.

## Открытые вопросы

- Конфликты с браузерными хоткеями (`Ctrl+S`, `Ctrl+W`) — предупреждаем в UI и позволяем сохранить, но только если комбинация не критична.
- Режим "записи" комбинации — учитывать `keydown` без `keypress`, чтобы ловить модификаторы корректно.
- Export/Import пресетов хоткеев — JSON. Отдельная кнопка «Reset to defaults».
- Layout-aware: у юзера с AZERTY клавиши могут быть в других местах. Использовать `e.code` вместо `e.key` для раскладко-независимости? По умолчанию — да, для букв.
