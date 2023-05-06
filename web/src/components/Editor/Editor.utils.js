import * as uuid from 'uuid';
import { FRAME_TYPES } from './Editor.constants';
import JSZip from 'jszip';

export const getEmptyFrame = (type = FRAME_TYPES.FRAME) => ({
    dataUrl: '',
    id: btoa(uuid.v4()),
    type,
});

export const getEmptyLayer = (frames) => ({
    id: btoa(uuid.v4()),
    frames,
    isVisible: true,
    isSupport: false,
});

export const archiveProject = async (layers, layersMap, framesMap) => {
    const zip = new JSZip();
    const frames = {};
    Object.keys(framesMap).forEach((key) => {
        frames[key] = {... framesMap[key], dataUrl: ''};
    });
   // console.log('frames', frames);
    if(window.CompressionStream) {
        // eslint-disable-next-line no-undef
        const compressedStream = await new Response(JSON.stringify({layers, layersMap, frames})).body.pipeThrough(new CompressionStream('deflate-raw'))
        const bytes = await new Response(compressedStream).arrayBuffer();
        console.log('deflate', bytes);

        // eslint-disable-next-line no-undef
        const compressedStream2 = await new Response(JSON.stringify({layers, layersMap, frames})).body.pipeThrough(new CompressionStream('gzip'))
        const bytes2 = await new Response(compressedStream2).arrayBuffer();
        console.log('gzip', bytes2);
       // return bytes
    }
    zip.file('project.json', JSON.stringify({layers, layersMap, frames}));
    zip.generateAsync({type: 'string', compression: "DEFLATE"}).then((content) => {
        console.log(content.length);
    });
};