// Measures inter-tick interval during play. Captures real user-perceived
// frame cadence: when a long task blocks main thread, the next setTimeout
// fires late, so delta between ticks reflects actual slowdown.

const MAX_SAMPLES = 60;
const REPORT_EVERY = 10;

let lastTickTs = null;
let samples = [];
let drawSamples = [];

const percentile = (sorted, p) => sorted[Math.floor((sorted.length - 1) * p)];

const stats = (arr) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
    return {
        avg,
        p50: percentile(sorted, 0.5),
        p95: percentile(sorted, 0.95),
        p99: percentile(sorted, 0.99),
        min: sorted[0],
        max: sorted[sorted.length - 1],
    };
};

export const playTick = () => {
    const now = performance.now();
    if (lastTickTs != null) {
        const delta = now - lastTickTs;
        samples.push(delta);
        if (samples.length > MAX_SAMPLES) samples.shift();
        if (samples.length >= REPORT_EVERY && samples.length % REPORT_EVERY === 0) {
            const s = stats(samples);
            const fps = 1000 / s.avg;
            const d = drawSamples.length ? stats(drawSamples) : null;
            const drawStr = d
                ? `  draw avg=${d.avg.toFixed(1)}ms p50=${d.p50.toFixed(1)} p95=${d.p95.toFixed(1)}`
                : '';
            // eslint-disable-next-line no-console
            console.log(
                `[play] n=${samples.length}  tick avg=${s.avg.toFixed(1)}ms (${fps.toFixed(1)}fps) p50=${s.p50.toFixed(1)} p95=${s.p95.toFixed(1)}${drawStr}`
            );
        }
    }
    lastTickTs = now;
};

export const drawSceneMark = (durMs) => {
    drawSamples.push(durMs);
    if (drawSamples.length > MAX_SAMPLES) drawSamples.shift();
};

export const resetPlayMetrics = () => {
    if (samples.length > 0) {
        const s = stats(samples);
        // eslint-disable-next-line no-console
        console.log(
            `[play] final tick n=${samples.length}  avg=${s.avg.toFixed(1)}ms  min=${s.min.toFixed(1)}  p50=${s.p50.toFixed(1)}  p95=${s.p95.toFixed(1)}  p99=${s.p99.toFixed(1)}  max=${s.max.toFixed(1)}`
        );
    }
    if (drawSamples.length > 0) {
        const d = stats(drawSamples);
        // eslint-disable-next-line no-console
        console.log(
            `[play] final draw n=${drawSamples.length}  avg=${d.avg.toFixed(1)}ms  min=${d.min.toFixed(1)}  p50=${d.p50.toFixed(1)}  p95=${d.p95.toFixed(1)}  p99=${d.p99.toFixed(1)}  max=${d.max.toFixed(1)}`
        );
    }
    lastTickTs = null;
    samples = [];
    drawSamples = [];
};
