# 013 — Направляющие (guidelines)

## Цель

Классические вытягиваемые линейки, как в Photoshop/Figma: на линейках сверху и слева можно зажать и потянуть — появляется горизонтальная/вертикальная направляющая. Не экспортируется, нужна для выравнивания.

## Data model (draft)

```js
// В Dexie draft + Recoil
guides: [
  { id, orientation: 'h' | 'v', position },  // position в мировых координатах (paper-local px)
]
```

Attribute — **локальный для draft/проекта**, то есть живёт вместе с проектом и не расшаривается между разными работами.

На публикацию — не включаем в source.zip (или включаем опционально). **Не попадает в preview/thumbnail/export.**

## UI

### Линейки

- Тонкие полоски (20px) по верху и слева от холста.
- Показывают единицы (px) с тиками каждые 50-100px.
- На линейке отображается текущая позиция курсора маркером.
- Можно скрыть/показать через `View → Rulers` или хоткей (например `Ctrl+R`).

### Направляющие

- Зажать на линейке → потянуть в canvas → появляется линия.
- Линия отображается на слое над всем (stage, не Konva.Layer юзера) — синяя `#2b7dff`, 1px.
- При наведении на существующую линию — курсор меняется, можно перетащить.
- `Ctrl+click` на линии или Drag обратно на линейку — удаляет.
- Snapping: при рисовании/переносе других элементов, при приближении на <8px к линии — залипает.

### Хоткеи

- `Ctrl+R` — toggle линейки.
- `Ctrl+;` — toggle видимость направляющих (оставить на месте, но скрыть отрисовку).
- `Ctrl+Alt+;` — lock/unlock (нельзя перетащить).
- `Ctrl+Alt+R` — убрать все направляющие.

## Реализация в Konva

Отдельный `Konva.Layer` для guides, поверх всех user-layers, с `listening: true` для интерактивности линий. В stage/canvas event flow:
- По `mousedown` на линейке (HTML-элемент над stage): start dragging.
- На `mousemove`: draw preview line on guides-layer.
- На `mouseup`: save guide to Recoil/Dexie.

Рисуются как `Konva.Line` с `strokeWidth: 1`. На lockable guides можно `draggable: !locked`.

## Snap-to-guide

Опционально. Простая реализация: при brush `startDrawing` / `draw`, если курсор в ±8px от guide position, clamp к ней. Но для рисования (кисть) snapping неудобен — лучше применять к перемещению слоёв (которого у нас нет пока).

v1: **без snapping**, просто визуальная разметка.

## Персистентность

- `guides` — часть state, сохраняется в Dexie draft вместе с `layers/framesMap/layersMap`.
- При publish: не включаем в manifest (не нужно для зрителей).
- При fork/edit: если автор оставил направляющие — наследник их получает вместе с source (можно включить опциональной галочкой «Include guides» в publish-модалке).

## Открытые вопросы

- **Ruler unit**: pixels по умолчанию. Добавлять ли mm/cm/inches — нет, редактор digital, единицы не важны.
- **Guide text labels**: показывать ли число при drag? Photoshop показывает — полезно. Добавим.
- **Global vs per-frame**: direction на всё время проекта, не на конкретный кадр. Т.е. `guides` — не в frame, а в project/draft level.
- **Clip to paper bounds**: показывать guide только в пределах paper или и на infinite canvas? Пусть идёт по всему stage, как в Photoshop.
