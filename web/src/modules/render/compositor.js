const loadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
});

const canvasToBlob = (canvas, type = 'image/png') =>
    new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('canvas.toBlob returned null'));
        }, type);
    });

const blobToUint8 = async (blob) => new Uint8Array(await blob.arrayBuffer());

export const compositeFrames = async (
    { layers, layersMap, framesMap },
    { width = 1024, height = 600, background = 'white', format = 'image/webp', quality = 0.9 } = {},
    onProgress,
) => {
    let frameCount = 0;
    layers.forEach((lid) => {
        const len = layersMap[lid]?.frames?.length || 0;
        if (len > frameCount) frameCount = len;
    });

    const orderedLayers = [...layers].reverse();
    const visibleLayers = orderedLayers.filter(
        (lid) => !layersMap[lid]?.isSupport && layersMap[lid]?.isVisible !== false,
    );

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const blobs = [];
    for (let i = 0; i < frameCount; i++) {
        const imagePromises = [];
        for (const lid of visibleLayers) {
            const frameId = layersMap[lid].frames[i];
            const frame = frameId && framesMap[frameId];
            if (frame && frame.dataUrl) {
                imagePromises.push(loadImage(frame.dataUrl));
            }
        }
        const images = await Promise.all(imagePromises);

        ctx.fillStyle = background;
        ctx.fillRect(0, 0, width, height);
        for (const img of images) ctx.drawImage(img, 0, 0, width, height);

        const blob = await new Promise((resolve, reject) => {
            canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob null'))), format, quality);
        });
        blobs.push(blob);
        if (onProgress) onProgress(i + 1, frameCount);
    }
    return { blobs, frameCount, width, height };
};

export const blobsToUint8Array = async (blobs) => {
    const out = new Array(blobs.length);
    for (let i = 0; i < blobs.length; i++) out[i] = await blobToUint8(blobs[i]);
    return out;
};
