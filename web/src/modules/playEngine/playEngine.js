// Play engine — pre-decoded bitmap cache with async prefetch.
// During play we bypass Konva entirely: compose each frame's visible layers
// onto an OffscreenCanvas once, transfer to ImageBitmap, and the play canvas
// just does ctx.drawImage(bitmap) per tick — 1-2ms vs Konva's 40ms+.

const PAPER_WIDTH = 1024;
const PAPER_HEIGHT = 600;
const PAPER_Y = 120;           // must match Canvas.jsx PAPER_Y
const LOOKAHEAD = 30;          // frames to keep prefetched ahead of current
const EVICT_WINDOW = 60;       // drop bitmaps farther than this from current

const cache = new Map();       // index → ImageBitmap

const hasOffscreen = typeof OffscreenCanvas !== 'undefined';

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const compositeFrame = async (slice) => {
  let canvas;
  if (hasOffscreen) {
    canvas = new OffscreenCanvas(PAPER_WIDTH, PAPER_HEIGHT);
  } else {
    canvas = document.createElement('canvas');
    canvas.width = PAPER_WIDTH;
    canvas.height = PAPER_HEIGHT;
  }
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, PAPER_WIDTH, PAPER_HEIGHT);
  for (const layer of slice) {
    if (!layer.isVisible || !layer.dataUrl) continue;
    try {
      const img = await loadImage(layer.dataUrl);
      // dataUrl may be either:
      //   (a) full-stage sized (window.innerWidth × window.innerHeight) with
      //       the paper centered at (paperX, PAPER_Y) — classic onCanvasUpdated path;
      //   (b) already paper-cropped (PAPER_WIDTH × PAPER_HEIGHT) — publish path.
      // Detect by dimensions and crop accordingly.
      if (img.width === PAPER_WIDTH && img.height === PAPER_HEIGHT) {
        ctx.drawImage(img, 0, 0, PAPER_WIDTH, PAPER_HEIGHT);
      } else {
        const paperX = Math.max(0, Math.round(img.width / 2 - PAPER_WIDTH / 2));
        const paperY = Math.min(PAPER_Y, Math.max(0, img.height - PAPER_HEIGHT));
        ctx.drawImage(
          img,
          paperX, paperY, PAPER_WIDTH, PAPER_HEIGHT,
          0, 0, PAPER_WIDTH, PAPER_HEIGHT,
        );
      }
    } catch (e) {
      // skip broken layer, keep composing
    }
  }
  if (hasOffscreen) return canvas.transferToImageBitmap();
  return await createImageBitmap(canvas);
};

const circularDistance = (a, b, total) => {
  if (total <= 1) return 0;
  const forward = (b - a + total) % total;
  const backward = (a - b + total) % total;
  return Math.min(forward, backward);
};

const evictOutsideWindow = (current, total) => {
  for (const key of cache.keys()) {
    if (circularDistance(current, key, total) > EVICT_WINDOW) {
      const bm = cache.get(key);
      bm?.close?.();
      cache.delete(key);
    }
  }
};

export const getBitmap = (index) => cache.get(index) || null;

export const invalidateAll = () => {
  for (const bm of cache.values()) bm?.close?.();
  cache.clear();
};

export const invalidateIndex = (index) => {
  const bm = cache.get(index);
  if (bm) {
    bm.close?.();
    cache.delete(index);
  }
};

// Spawns an async loop that keeps LOOKAHEAD bitmaps prefetched ahead of
// the current playhead. Returns a cancel function.
export const startPrefetchWorker = (getState, getSliceAt) => {
  let cancelled = false;
  (async () => {
    while (!cancelled) {
      const state = getState();
      const current = state.currentIndex;
      const total = state.longest || 1;
      let workDone = 0;
      for (let offset = 0; offset < LOOKAHEAD; offset++) {
        if (cancelled) return;
        const idx = (current + offset) % total;
        if (cache.has(idx)) continue;
        const slice = getSliceAt(state, idx);
        if (!slice || slice.length === 0) continue;
        try {
          const bitmap = await compositeFrame(slice);
          if (cancelled) { bitmap?.close?.(); return; }
          cache.set(idx, bitmap);
          evictOutsideWindow(current, total);
          workDone++;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('[playEngine] prefetch failed', idx, e);
        }
      }
      // Nothing to do? Sleep a bit before re-checking (playhead may have advanced).
      if (workDone === 0) {
        await new Promise((r) => setTimeout(r, 30));
      } else {
        // Yield so we don't monopolise main thread.
        await new Promise((r) => setTimeout(r, 0));
      }
    }
  })();
  return () => { cancelled = true; };
};

export const getCacheSize = () => cache.size;

export const PAPER_DIMENSIONS = { width: PAPER_WIDTH, height: PAPER_HEIGHT };
