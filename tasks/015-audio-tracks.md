# 015 — Звуковые дорожки на таймлайне

## Цель

Пользователь импортирует mp3/wav, видит их волной на таймлайне, тягает в нужную позицию, слышит при воспроизведении и получает итоговый ролик **со звуком**. Опционально — несколько дорожек, обрезка, громкость.

## Оценка сложности

**~2 недели полного времени.** Не тривиально из-за двух вещей:

1. **Экспорт со звуком** — наш текущий формат (animated WebP) не поддерживает audio вообще. Нужно менять пайплайн публикации.
2. **Синхронизация frame playback и audio** — сейчас кадры крутятся через `setTimeout(100ms)`, звук через Web Audio работает в real-time. За секунды накопится drift. Нужен единый clock.

## Data model

### Project (расширение)

```js
audioTracks: [{
    id,
    fileName,           // "voice-over-1.mp3"
    audioKey,           // S3/local storage key (для published) ИЛИ dexie blob id (для draft)
    startMs,            // позиция на таймлайне, от начала
    durationMs,         // длина оригинала
    trimStartMs,        // опциональная обрезка с начала
    trimEndMs,          // опциональная обрезка с конца
    volume,             // 0..1
    muted: bool,
}]
```

Audio-файлы **не внутри framesMap** — это отдельный массив, потому что они не привязаны к конкретному кадру, а лежат во времени.

### Source zip при publish

Сейчас zip содержит PNG кадры + `manifest.json`. Добавить `audio/{trackId}.mp3` и запись в manifest.

## Импорт

1. Кнопка «Add audio» / drag-and-drop на таймлайн.
2. `<input type="file" accept="audio/*">` — получаем `File`.
3. Декодируем через `AudioContext.decodeAudioData(arrayBuffer)` → `AudioBuffer` (не блокирует UI, async).
4. Генерим waveform peaks: упрощённый массив (say 1000 сэмплов) min/max амплитуд → Uint8Array. Хранится отдельно чтобы не перерендер всей волны на каждый скролл.
5. Сохраняем оригинальный blob в **dexie** (для draft) → `audioBlobs` таблица.
6. В `audioTracks` state пишем метаданные + blobRef.

## UI: waveform на таймлайне

- Отдельная секция под фреймами/слоями — **Audio tracks**.
- Каждая дорожка — горизонтальный блок с waveform (Canvas-draw minimax peaks).
- Блок позиционируется по `startMs * pxPerMs`.
- Drag — меняем `startMs`.
- Edges дорожки — ручки для trim (shift edge меняет `trimStartMs/trimEndMs`, не сам blob).
- Right-click → меню: Delete / Set volume / Mute.

Библиотеки:
- **wavesurfer.js** — готовое решение, но сильно overkill для наших нужд и 300KB. Лучше свой код.
- Можно реализовать руками: 100 строк canvas drawing + peaks computation.

## Playback: синхронизация

Ключевое изменение — единый **clock через Web Audio**:

```js
const ctx = new AudioContext();
const startTime = ctx.currentTime + 0.1;  // небольшой lookahead

// Schedule audio
tracks.forEach(track => {
    const source = ctx.createBufferSource();
    source.buffer = track.audioBuffer;
    source.connect(gainNode).connect(ctx.destination);
    source.start(startTime + track.startMs / 1000, track.trimStartMs / 1000);
});

// Drive frames off the same clock via requestAnimationFrame
const tick = () => {
    const elapsedMs = (ctx.currentTime - startTime) * 1000;
    const frameIndex = Math.floor(elapsedMs / frameDurationMs);
    setCurrentIndex(frameIndex);
    if (playing) requestAnimationFrame(tick);
};
```

Переменная частота кадров (10 fps сейчас, но можно настраивать) — frameDurationMs = 1000 / fps.

Pause/resume — сохраняем `ctx.currentTime` на паузе, продолжаем с offset.

## Export со звуком — три варианта

### A. ffmpeg.wasm (~25MB в бандл)
- Рендерим кадры → PNG последовательно, как сейчас.
- Используем ffmpeg.wasm чтобы собрать `.mp4` из PNG sequence + mp3.
- Плюс: полный контроль качества, любой формат.
- Минус: жирный бандл (lazy-load по кнопке Publish); ffmpeg.wasm не всегда стабилен в Safari; encoding на клиенте жжёт батарею телефона.

### B. MediaRecorder API (нативно)
- Создаём `<canvas>` 1024×600.
- Рисуем каждый кадр вовремя (наш playback тик).
- `canvas.captureStream()` → video track.
- Audio через `MediaStreamAudioDestinationNode` → audio track.
- Объединяем в `MediaStream`, отдаём в `MediaRecorder(type: 'video/webm')`.
- На stop → Blob → upload.
- Плюс: нативно, без wasm-довеска, ~50 LOC.
- Минус: только WebM (не все соцсети понимают), real-time — ролик 30 сек экспортируется 30 сек.

### C. Сервер-сайд ffmpeg
- Клиент шлёт source.zip + audio blobs.
- Бэкенд: установлен ffmpeg, собирает mp4.
- Плюс: быстро, клиенту не грузить wasm.
- Минус: требует ffmpeg на прод-хосте (в Docker OK), CPU time стоит, нужна очередь задач.

### Рекомендация
**B для MVP, C после первых 1k юзеров.** MediaRecorder — простейшее и самое быстрое внедрение. WebM шаринг — в Twitter/Discord без проблем, в Instagram придётся конвертить. Когда появятся деньги → перекинуть на сервер.

## Backend изменения

### Storage
- `MAX_SOURCE_BYTES` увеличить (текущий 20MB → 50MB для audio-heavy проектов).
- `POST /api/projects/publish` — audio_files[] как отдельные поля multipart.

### Модель
- `Project.audioTracks: [{...}]` — метаданные.
- `Project.audioKeys: [String]` — ключи S3/local для аудио-blob'ов.

### Rate limit
- Upload аудио учитывать в квоте Pro-плана (см. 007).

## Storage implications

- 30-сек mp3 128kbps ≈ 500 KB.
- 3-мин mp3 ≈ 3 MB.
- Средний проект с voice-over 1-2 MB.
- Топ-юзер с 10 проектами × 2 дорожки × 2 MB = 40 MB.
- На local disk → норм. На R2 → $0.015/GB*N юзеров.

## Мобилка

- iOS Safari: AudioContext требует user gesture для старта. Обернуть первое Play в обработчик клика.
- iOS: нет `ogg`, ограниченный Opus. Принимаем mp3/aac/wav.
- Capture stream / MediaRecorder в WebKit — частично работает. Нужно тестировать.

## Open questions

- **Waveform peaks caching**: считать на импорте и хранить массивом в audioTracks? Да, чтобы не пересчитывать при каждом открытии draft.
- **Несколько дорожек одновременно** или одна? Начнём с одной — простейший MVP. Многодорожечность — v2.
- **Volume automation** (громкость меняется по таймлайну): не надо, overkill.
- **Effects** (reverb, EQ): тем более нет.
- **Trim через редактирование blob'а или через `trimStart/End`?** Через метаданные (не режем blob). Проще undo/redo, не теряем оригинал.
- **AAC vs MP3 vs WAV для хранения?** MP3 — универсально, небольшой размер. Если юзер загружает WAV — перекодируем в MP3 через `AudioContext.decodeAudioData + OfflineAudioContext.render + lamejs` или просто храним как есть (дороже по месту).
- **Quick «record voice»** через микрофон прямо в редакторе (MediaRecorder от `getUserMedia`). Класс, но отдельная подзадача.

## Зависимости

- `@tanstack/react-query` — уже есть.
- `konva` — уже есть (для waveform если будем рисовать на canvas отдельно — можно и без).
- **ffmpeg.wasm** — только если выбираем вариант A экспорта. Lazy-load при нажатии Publish.
- **lamejs** — если хотим транскодить WAV в MP3 на клиенте при импорте. Опционально.

## Не в скоупе v1

- Multitrack mixing с эффектами.
- Встроенная библиотека free sound effects.
- Автоматическое lip-sync.
- Сплит моно → stereo / ducking voice против музыки.
