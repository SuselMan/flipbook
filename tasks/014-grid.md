# 014 — Настраиваемая сетка

## Цель

Overlay-сетка на canvas для выравнивания. Конфигурируется: тип (квадратная / изометрическая / hex), шаг, цвет, прозрачность. Опциональный snap-to-grid.

## Data model

```js
grid: {
  enabled: false,              // toggle через hotkey / меню
  type: 'square',              // 'square' | 'iso' | 'hex'
  spacing: 32,                 // px
  divisions: 4,                // тонкие подсекции между толстыми линиями
  color: '#888',               // HEX
  opacity: 0.15,
  snap: false,
},
```

Персистится **в localStorage** (не в draft): это настройка редактора, не проекта. Юзер один раз настроил шаг под свой стиль — используется во всех draft'ах.

## UI

- Toggle сетки: хоткей `Ctrl+'` (или через меню View).
- Settings — отдельный диалог «Grid Settings» в `/me/settings/grid` или в popover из кнопки в тулбаре.
  - Preview сетки в реальном времени.
  - Inputs: type select, spacing input, divisions, color picker, opacity slider, snap toggle.
  - Кнопка Reset to defaults.

## Реализация в Konva

Отдельный `Konva.Layer` grid, поверх paper-слоя, но под user-layers (чтобы не перекрывать рисование):
- Видимость: `layer.visible(grid.enabled)`.
- Содержимое: набор `Konva.Line` / `Konva.Rect` по координатной сетке.
- `listening: false` — сквозная для событий.

### Типы

**Square grid:**
```
for x = 0; x <= width; x += spacing:  vertical line
for y = 0; y <= height; y += spacing: horizontal line
каждую `divisions`-ю линию — толще/темнее
```

**Isometric grid:**
60-градусные линии: три набора линий под углами 30°, 150°, 90° (или 0°/60°/120°). Шаг определяет расстояние между параллельными линиями.

**Hex grid:**
Ряды шестиугольников. Чуть сложнее в реализации — может отложить на v2.

### Только в пределах paper?

Два варианта:
- Только на paper (1024×600) — сетка всегда в границах холста.
- На всём stage (infinite) — сетка везде, удобно при zoom+pan.

Сделать настройкой в grid settings: «Grid scope: paper / canvas» — или просто решить по дефолту что paper. Наверно paper понятнее.

## Snap-to-grid

Если `grid.snap === true`, при `startDrawing` начало штриха залипает к ближайшему узлу сетки. При `draw` каждая новая точка штриха тоже.

Тривиально: `x = Math.round(x / spacing) * spacing`.

Для изо/hex — соответствующие формулы.

Опционально добавить `Alt` для временного отключения snap (как в Photoshop).

## Хоткеи

- `Ctrl+'` — toggle grid visibility.
- `Ctrl+Shift+'` — toggle snap (если enabled).

## Открытые вопросы

- **Snap для fill / selection / move**: flood fill не имеет позиций, snap не нужен. Selection/move — нет в проекте. Так что snap = только для brush/eraser штрихов.
- **Per-project grid vs global**: глобально — настройка редактора. Если кому-то нужна проектная (например, для специфических размеров) — добавим override позже.
- **Hex grid**: сложнее, можно отложить. Square + iso покрывают 99% use-cases для мультяшной анимации.
- **Grid в published-preview**: **нет**. Экспорт идёт без сетки всегда.
