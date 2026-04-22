// Measures brush input latency: from raw pointermove (event.timeStamp) to the
// frame being painted. Captures the full pipeline — event queue, React
// rerenders in Editor cascade, Konva batchDraw, browser paint.
//
// event.timeStamp and performance.now() share the same origin
// (navigationStart) so subtraction gives real ms.

const MAX_SAMPLES = 120;
const REPORT_EVERY = 30;

let totals = [];       // event → painted
let handledSamples = []; // event → handler entry (queue delay)
let drawSamples = [];    // handler entry → batchDraw return (JS work)

const percentile = (sorted, p) => sorted[Math.floor((sorted.length - 1) * p)];

const stats = (arr) => {
    if (!arr.length) return null;
    const sorted = [...arr].sort((a, b) => a - b);
    return {
        avg: arr.reduce((a, b) => a + b, 0) / arr.length,
        p50: percentile(sorted, 0.5),
        p95: percentile(sorted, 0.95),
        p99: percentile(sorted, 0.99),
        min: sorted[0],
        max: sorted[sorted.length - 1],
    };
};

// Call at the very start of the pointermove handler.
// Returns a context to pass to brushDrawEnd.
export const brushMoveStart = (eventTimeStamp) => ({
    eventTs: eventTimeStamp,
    handledTs: performance.now(),
});

// Call AFTER the drawing/batchDraw work but synchronously in the handler.
// Schedules a paint measurement via double-rAF (fires after the actual paint).
export const brushDrawEnd = (ctx) => {
    const afterDraw = performance.now();
    const queueDelay = ctx.handledTs - ctx.eventTs;
    const jsWork = afterDraw - ctx.handledTs;

    // Double rAF = guaranteed after paint completed (first rAF = before paint,
    // second rAF = next frame, by which time the paint has flipped).
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const painted = performance.now();
            const total = painted - ctx.eventTs;
            totals.push(total);
            handledSamples.push(queueDelay);
            drawSamples.push(jsWork);
            if (totals.length > MAX_SAMPLES) {
                totals.shift(); handledSamples.shift(); drawSamples.shift();
            }
            if (totals.length >= REPORT_EVERY && totals.length % REPORT_EVERY === 0) {
                reportStats();
            }
        });
    });
};

const reportStats = () => {
    const t = stats(totals);
    const q = stats(handledSamples);
    const w = stats(drawSamples);
    // eslint-disable-next-line no-console
    console.log(
        `[brush] n=${totals.length}  total avg=${t.avg.toFixed(1)}ms p50=${t.p50.toFixed(1)} p95=${t.p95.toFixed(1)}` +
        `  queue avg=${q.avg.toFixed(1)}ms p95=${q.p95.toFixed(1)}` +
        `  js avg=${w.avg.toFixed(1)}ms p95=${w.p95.toFixed(1)}`
    );
};

export const resetBrushMetrics = () => {
    if (totals.length > 0) {
        const t = stats(totals);
        const q = stats(handledSamples);
        const w = stats(drawSamples);
        // eslint-disable-next-line no-console
        console.log(
            `[brush] final n=${totals.length}` +
            `  total avg=${t.avg.toFixed(1)}ms p50=${t.p50.toFixed(1)} p95=${t.p95.toFixed(1)} p99=${t.p99.toFixed(1)} max=${t.max.toFixed(1)}` +
            `  queue avg=${q.avg.toFixed(1)}ms p95=${q.p95.toFixed(1)}` +
            `  js avg=${w.avg.toFixed(1)}ms p95=${w.p95.toFixed(1)}`
        );
    }
    totals = [];
    handledSamples = [];
    drawSamples = [];
};
