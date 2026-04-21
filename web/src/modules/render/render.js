import JSZip from 'jszip';
import { compositeFrames, blobsToUint8Array } from './compositor';
import { encodeAnimatedWebp } from './webpEncoder';

export const STAGES = {
    COMPOSITING: 'compositing',
    ENCODING: 'encoding',
    PACKING: 'packing',
};

export const renderPreview = async (state, options, onStage) => {
    onStage && onStage(STAGES.COMPOSITING, 0);
    const { blobs, frameCount, width, height } = await compositeFrames(
        state,
        options,
        (done, total) => onStage && onStage(STAGES.COMPOSITING, done / total),
    );
    if (frameCount === 0) {
        throw new Error('Project has no frames to render');
    }

    onStage && onStage(STAGES.ENCODING, 0);
    const bytes = await blobsToUint8Array(blobs);
    const previewBlob = await encodeAnimatedWebp(bytes, { fps: options?.fps || 10 });
    onStage && onStage(STAGES.ENCODING, 1);

    const thumbnailBlob = blobs[0];

    return { previewBlob, thumbnailBlob, frameCount, width, height };
};

export const packSource = async (state, meta = {}, onStage) => {
    onStage && onStage(STAGES.PACKING, 0);
    const zip = new JSZip();

    const framesMap = state.framesMap || {};
    const keys = Object.keys(framesMap);
    const manifestFrames = {};

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const frame = framesMap[key];
        let fileName = null;
        if (frame && frame.dataUrl) {
            const resp = await fetch(frame.dataUrl);
            const blob = await resp.blob();
            fileName = `frames/${key}.png`;
            zip.file(fileName, blob);
        }
        manifestFrames[key] = {
            id: frame?.id || key,
            type: frame?.type,
            json: frame?.json || null,
            file: fileName,
        };
        onStage && onStage(STAGES.PACKING, (i + 1) / keys.length);
    }

    zip.file('manifest.json', JSON.stringify({
        version: 1,
        ...meta,
        layers: state.layers,
        layersMap: state.layersMap,
        frames: manifestFrames,
    }, null, 2));

    return zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
    });
};

export const unpackSource = async (blob) => {
    const zip = await JSZip.loadAsync(blob);
    const manifestFile = zip.file('manifest.json');
    if (!manifestFile) throw new Error('manifest.json missing from project');
    const manifest = JSON.parse(await manifestFile.async('string'));

    const framesMap = {};
    for (const [key, meta] of Object.entries(manifest.frames || {})) {
        let dataUrl = '';
        if (meta.file) {
            const file = zip.file(meta.file);
            if (file) {
                const pngBlob = await file.async('blob');
                dataUrl = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(pngBlob);
                });
            }
        }
        framesMap[key] = {
            id: meta.id || key,
            type: meta.type,
            json: meta.json || null,
            dataUrl,
        };
    }

    return {
        layers: manifest.layers || [],
        layersMap: manifest.layersMap || {},
        framesMap,
        meta: {
            name: manifest.name,
            description: manifest.description,
            fps: manifest.fps,
            canvasWidth: manifest.canvasWidth,
            canvasHeight: manifest.canvasHeight,
        },
    };
};
