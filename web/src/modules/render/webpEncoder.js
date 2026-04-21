export const encodeAnimatedWebp = (frames, { fps = 10, compression = 80 } = {}) =>
    new Promise((resolve, reject) => {
        const worker = new Worker(`${process.env.PUBLIC_URL || ''}/webp/worker.js`);
        const delay = Math.max(1, Math.round(1000 / fps));

        const cleanup = () => {
            worker.terminate();
        };

        worker.onerror = (err) => {
            cleanup();
            reject(err);
        };

        worker.onmessage = (e) => {
            const [kind, payload] = e.data;
            if (kind === 'ready') {
                try {
                    for (const u8 of frames) {
                        worker.postMessage(['addFrame', u8, { delay, compression }]);
                    }
                    worker.postMessage(['generate']);
                } catch (err) {
                    cleanup();
                    reject(err);
                }
            } else if (kind === 'generate') {
                cleanup();
                resolve(new Blob([payload], { type: 'image/webp' }));
            }
        };
    });
