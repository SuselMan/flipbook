import * as uuid from 'uuid';
import { FRAME_TYPES } from './Editor.constants';
import JSZip from 'jszip';
import { AnimationGenerator } from 'webp-animation-generator';

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

export const makeMovie = async (layers, layersMap, framesMap) => {

  // const instance = new AnimationGenerator();
  //
  // await instance.init('/webp/worker.js');

  // TODO: check is empty slice properly handled
  let framesLength = 0;
  let longestLayer = null;
  const framesImages = [];
  layers.forEach((key) => {
    if (!longestLayer || layersMap[key].frames.length > longestLayer.frames.length) {
      longestLayer = layersMap[key];
    };
    framesLength = Math.max(framesLength, layersMap[key].frames.length);
  });
  let i = 0;
  for (const item of longestLayer.frames) {
      const images = [];
      layers.forEach((key) => {
        console.log('layersMap[key].frames[i]', layersMap[key].frames[i])
        const frameId = layersMap[key].frames[i] || null;
        const frame = framesMap[frameId]
        const image = new Image();
        if (frame && frame.dataUrl) {
          image.src = frame.dataUrl;
          const promise = new Promise((resolve) => {
            image.onload = () => {
              resolve(image);
            };
          });
          images.push(promise);
        }
      });
      await Promise.all(images).then(async (imagesArr) => {
        const canvas = document.createElement('canvas')
        canvas.width = 1024;
        canvas.height = 600;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 1024, 600);
        imagesArr.forEach((image) => {
          ctx.drawImage(image, 0, 0);
        });
        const frameImage = canvas.toDataURL( 'image/webp', 0.7);
        framesImages.push(frameImage);
      });
      i = i + 1;
  }
  console.log('framesImages', framesImages);
  return framesImages;
  // framesImages.forEach((image) => {
  //   instance.addFrame(new Uint8Array(image));
  // });
  // const result = await instance.generate();
  // console.log(result);
  // const blob = new Blob([result.buffer], { type: 'image/webp' });
  // const img = document.createElement('img');
  // img.src = URL.createObjectURL(blob);
  // document.body.appendChild(img)
}

export const archiveProject = async (layers, layersMap, framesMap) => {
  const zip = new JSZip();
  const frames = {};
  Object.keys(framesMap).forEach((key) => {
    frames[key] = { ...framesMap[key], dataUrl: '' };
  });
  console.log('frames', frames);
  // if(window.CompressionStream) {
  //     // eslint-disable-next-line no-undef
  //     const compressedStream = await new Response(JSON.stringify({layers, layersMap, frames})).body.pipeThrough(new CompressionStream('deflate-raw'))
  //     const bytes = await new Response(compressedStream).arrayBuffer();
  //     console.log('deflate', bytes);
  //
  //     // eslint-disable-next-line no-undef
  //     const compressedStream2 = await new Response(JSON.stringify({layers, layersMap, frames})).body.pipeThrough(new CompressionStream('gzip'))
  //     const bytes2 = await new Response(compressedStream2).arrayBuffer();
  //     console.log('gzip', bytes2);
  //    // return bytes
  // }

  const movie = await makeMovie(layers, layersMap, framesMap);

  const options = {
    type: 'blob',
    compression: "DEFLATE",
    compressionOptions: {
      level: 9
    }
  };

  zip.file('project.json', JSON.stringify({ layers, layersMap, frames, movie }));
  return zip.generateAsync(options).then((content) => {
    console.log('content.size', content.size);
    return content;
  });
};