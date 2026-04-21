Дава# 003 — Undo / Redo в редакторе

Сейчас в `Editor.jsx` есть заглушки `const undo = () => {}` + `redo = () => {}`. Надо сделать.

## Два подхода

### A. Snapshot-based (простой)

Храним стек снапшотов Recoil-состояния `{layers, layersMap, framesMap}`.
- На каждое «meaningful» изменение кладём снапшот в undo-стек.
- Undo = pop со стека, восстановить.
- Redo = перенести обратно в undo.

**Плюсы:** реализация за пару часов, ничего не ломается.

**Минусы:** кадры хранят PNG dataUrl'ы (десятки KB каждый). Снапшот с 30 кадрами × 3 слоя может весить 5 MB. Стек из 50 снапшотов — 250 MB памяти. Это плохо.

**Митигация:** хранить снапшоты **без** `framesMap.dataUrl` по-умному: глубокий diff (хранить только изменённые фреймы). Либо лимит в 20 шагов.

### B. Command pattern (правильный)

Все мутации проходят через `dispatch(action)`:
- `{type: 'ADD_STROKE', frameId, stroke}` + обратная операция
- `{type: 'DELETE_FRAME', frameId, layerId, position}` + восстановить
- `{type: 'ADD_LAYER', layer}` + удалить
- и т.д.

Undo-стек хранит только `action + inverse`. Снапшотов нет.

**Плюсы:** экономная память, чистая архитектура, можно в будущем collaborative editing строить поверх.

**Минусы:** нужно переписать все селекторы-мутаторы в `Editor.state.js` в action-based вид. Инкрементальные stroke'и на canvas'е — самое неприятное (Konva сейчас напрямую пушит в frame.dataUrl).

## Решение

**Гибрид с уклоном в A для старта, B на потом:**

1. Snapshot-based с diff-оптимизацией: в стек кладём diff {changedFrames, changedLayers} вместо полного snapshot. Лимит 30 шагов.
2. `dataUrl` храним в WeakMap'е вне Recoil — меньше сериализаций.
3. Запись в стек по событиям:
   - `endDrawing` на canvas'е (окончание штриха)
   - `addFrame`, `deleteFrame`, `clearFrame`
   - `addLayer`, `deleteLayer`, переупорядочивание слоёв
   - `duplicateFrame`
4. Undo/Redo — через Recoil `useRecoilCallback` + `unstable_batchedUpdates` (мы уже используем в hydrate).

## API hook

```js
const { undo, redo, canUndo, canRedo, record } = useHistory();
```

`record('addFrame', { layerId, position, frameId })` — зовётся из обработчиков.

Мапа `action.type → applyInverse(state, action.payload)` и `apply(state, action.payload)` для redo.

## Хоткеи

`Ctrl+Z` / `Ctrl+Shift+Z` / `Ctrl+Y` — делать в рамках 004.

## Открытые вопросы

- Очищать ли undo-стек при смене проекта (загрузке другого draft'а)? Да.
- Persist undo-стек в dexie? Нет — сессионная штука, хранить в памяти.
- Лимит глубины: 30 шагов (≈достаточно для 90% случаев).
