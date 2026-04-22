// Scanline flood fill with alpha tolerance to handle anti-aliased edges.
// Fills connected region starting at (x, y) with rgba color.
// `tolerance` — max allowed Manhattan distance in RGBA from the starting pixel.
//
// For typical drawing use case (white/transparent background, fill inside a
// closed ink outline), bumping alpha tolerance lets the fill "bleed" into
// semi-transparent edge pixels, avoiding visible white halos.

const hexToRgba = (hex, opacity = 1) => {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const a = Math.round(Math.max(0, Math.min(1, opacity)) * 255);
    return [r, g, b, a];
};

const colorDistance = (data, idx, target) => {
    return Math.abs(data[idx]     - target[0])
         + Math.abs(data[idx + 1] - target[1])
         + Math.abs(data[idx + 2] - target[2])
         + Math.abs(data[idx + 3] - target[3]);
};

export const floodFillImageData = (imageData, startX, startY, rgba, tolerance = 220) => {
    const { data, width, height } = imageData;
    startX = Math.round(startX);
    startY = Math.round(startY);
    if (startX < 0 || startY < 0 || startX >= width || startY >= height) return false;

    const startIdx = (startY * width + startX) * 4;
    const target = [data[startIdx], data[startIdx + 1], data[startIdx + 2], data[startIdx + 3]];

    // If starting pixel already matches fill color, nothing to do.
    if (Math.abs(target[0] - rgba[0]) + Math.abs(target[1] - rgba[1])
      + Math.abs(target[2] - rgba[2]) + Math.abs(target[3] - rgba[3]) < 8) {
        return false;
    }

    // Explicit visited bitmap. Needed because paint-under blending preserves
    // solid pixels unchanged (srcA=1 → outA=1 → output = src), so we can't
    // rely on "painted → different color" as a termination signal on solid
    // regions.
    const visited = new Uint8Array(width * height);

    const matches = (x, y) => {
        const idx = y * width + x;
        if (visited[idx]) return false;
        const i = idx * 4;
        return colorDistance(data, i, target) <= tolerance;
    };

    // Two paint modes depending on where the click landed:
    //
    //   • Start pixel is transparent / near-empty → user wants to fill
    //     an empty area inside a contour. Use paint-UNDER: existing pixel
    //     (stroke/AA edge) stays on top, fill slides beneath. Kills the halo
    //     between stroke outline and fill.
    //
    //   • Start pixel is opaque → user wants to REPLACE that colour with
    //     the fill colour. Use paint-OVER: overwrite rgba directly. Otherwise
    //     the solid region ends up unchanged (src fully opaque on top of
    //     fill = src) and only the AA rim gets tinted — the bug we just hit.
    const replaceMode = target[3] >= 128;
    const dstR = rgba[0];
    const dstG = rgba[1];
    const dstB = rgba[2];
    const dstA = rgba[3] / 255;
    const dstAByte = rgba[3];

    const paint = replaceMode
        ? (x, y) => {
            const idx = y * width + x;
            visited[idx] = 1;
            const i = idx * 4;
            data[i]     = dstR;
            data[i + 1] = dstG;
            data[i + 2] = dstB;
            data[i + 3] = dstAByte;
        }
        : (x, y) => {
            const idx = y * width + x;
            visited[idx] = 1;
            const i = idx * 4;
            const srcR = data[i];
            const srcG = data[i + 1];
            const srcB = data[i + 2];
            const srcA = data[i + 3] / 255;
            const outA = srcA + dstA * (1 - srcA);
            if (outA === 0) {
                data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 0;
                return;
            }
            data[i]     = Math.round((srcR * srcA + dstR * dstA * (1 - srcA)) / outA);
            data[i + 1] = Math.round((srcG * srcA + dstG * dstA * (1 - srcA)) / outA);
            data[i + 2] = Math.round((srcB * srcA + dstB * dstA * (1 - srcA)) / outA);
            data[i + 3] = Math.round(outA * 255);
        };

    // Scanline flood fill (Smith). Instead of pushing every neighbor pixel
    // as a seed (which blows up memory for large solid regions), we fill a
    // whole horizontal run at once and then push at most one seed per
    // *continuous matching span* in the row above/below.
    //
    // Flat stack: [x, y, x, y, ...] — avoids allocating [x, y] arrays for
    // every push (which is what previously caused OOM on big fills).
    const stack = [];
    stack.push(startX, startY);

    const scanRow = (xL, xR, y) => {
        if (y < 0 || y >= height) return;
        let inSpan = false;
        for (let x = xL; x <= xR; x++) {
            if (matches(x, y)) {
                if (!inSpan) {
                    stack.push(x, y);
                    inSpan = true;
                }
            } else {
                inSpan = false;
            }
        }
    };

    while (stack.length) {
        const y0 = stack.pop();
        const x0 = stack.pop();
        if (!matches(x0, y0)) continue;

        let xLeft = x0;
        while (xLeft > 0 && matches(xLeft - 1, y0)) xLeft--;
        let xRight = x0;
        while (xRight < width - 1 && matches(xRight + 1, y0)) xRight++;

        for (let x = xLeft; x <= xRight; x++) paint(x, y0);

        scanRow(xLeft, xRight, y0 - 1);
        scanRow(xLeft, xRight, y0 + 1);
    }
    return true;
};

export const floodFill = (ctx, x, y, hex, opacity = 1, tolerance = 220) => {
    const rgba = hexToRgba(hex, opacity);
    const { canvas } = ctx;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const changed = floodFillImageData(imageData, x, y, rgba, tolerance);
    if (changed) ctx.putImageData(imageData, 0, 0);
    return changed;
};
