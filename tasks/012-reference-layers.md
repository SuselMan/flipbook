# 012 — Монтажные (reference) слои

## Что это

В редакторе уже есть поле `isSupport: false` в модели слоя (`Editor.utils.js::getEmptyLayer`), и композитор при публикации его уже фильтрует:

```js
const visibleLayers = orderedLayers.filter(
    (lid) => !layersMap[lid]?.isSupport && layersMap[lid]?.isVisible !== false,
);
```

Но в UI переключателя нет, визуально слои неотличимы, и сам флаг никак не меняется. Нужно довести до ума.

## Семантика (open question)

У «монтажного» слоя может быть две разные интерпретации — надо выбрать одну или обе:

### Вариант A — Guide / reference слой
- Виден **только в редакторе**, не попадает в export.
- Имеет собственные кадры как обычный слой.
- Для чего: набросок, таймкод, техническая разметка, временные референсы.

### Вариант B — Static background слой
- Один и тот же bitmap показывается на **всех кадрах** (нет per-frame содержимого).
- Виден в export.
- Для чего: фон, логотип, рамка, неанимированные элементы.

### Вариант C — оба сразу
- `kind: 'raster' | 'static' | 'reference'` на слое.
- `static` — один кадр, показывается на всех.
- `reference` — с кадрами, не экспортируется.

Предварительная рекомендация — **вариант C**, но начать с раздельной реализации через два булевых флага чтобы не городить миграции: `isStatic: bool` (не имеет кадров) + `isReference: bool` (не экспортируется).

## Data model

```js
// Layer
{
  id,
  name,                       // + видимое имя, сейчас отсутствует
  frames,                     // для обычных и reference
  isVisible,
  kind: 'raster' | 'static' | 'reference',  // дискриминатор
  staticFrame: { dataUrl, json },            // для kind='static' — один кадр на весь таймлайн
  ...
}
```

При экспорте `kind==='reference'` пропускаем. `kind==='static'` растеризуем `staticFrame` на каждый кадр композита.

## UI

- В `LayerTools.jsx` добавить кнопку «Layer type» (например, dropdown) с тремя опциями.
- Для reference-слоя — полупрозрачная штриховка на фоне в таймлайне и/или метка `REF`.
- Для static-слоя — все фреймы показываются «растянутыми» визуально (один непрерывный блок на таймлайне).

## Визуал в canvas

- **Reference**: отрисовывается с opacity 0.5 или dashed-outline (как в Photoshop «Guide layer»). Можно переключать «show refs» глобальным toggle в тулбаре.
- **Static**: выглядит обычно, но его содержимое в `LayerFrames.jsx` не меняется по горизонтали кадров — скорее, один широкий thumbnail.

## Публикация / экспорт

В `modules/render/compositor.js::compositeFrames`:
- `kind==='reference'` → skip.
- `kind==='static'` → при каждом кадре композита ложим `staticFrame.dataUrl` на слой.

В `packSource`: сериализуем как обычно (одна запись на слой, `kind` сохраняется).

## Миграция

Существующие проекты не имеют `kind`. Default'им `kind` в `'raster'` в `getEmptyLayer`. При hydrate из draft'а без `kind` — тоже `'raster'`.

Существующий `isSupport` флаг — на переходный период мапим: `isSupport === true → kind = 'reference'`.

## Открытые вопросы

- Нужно ли давать переключать `kind` у уже существующего слоя с контентом? Static → raster — тривиально (копируем staticFrame во все кадры). Reference → raster — просто убрать флаг. Raster → static — требует решить, какой frame взять. Пусть берём текущий кадр.
- Layer name: сейчас слой без имени. Имеет смысл добавить, раз touch layers — отдельная задача.
- Иконка/цветной индикатор типа слоя в `LayerTools`.
