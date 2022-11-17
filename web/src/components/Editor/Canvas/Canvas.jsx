import React, { memo, useState, useImperativeHandle, useEffect, forwardRef } from 'react';
import { useStyles } from './Canvas.styles';
import clsx from 'clsx';
import Konva from 'konva';
import { initialLayer } from "../Editor.state";

let isPaint = false;
let mode = 'brush';
let stage;
let layers = [ { id: initialLayer.id, data: null } ];
let currentLayerId = initialLayer.id;
let currentLayerIndex = 0;
let currentLayer = null;

let supportLayerBefore = null;
let supportLayerAfter = null;
let lastLine;
let color = '#000';
let brushSize = 5;
let opacity = 1;
const DRAW_CONTAINER_ID = 'drawContainer';

const updateCurrentLayerIndex = () => {
    currentLayerIndex = layers.findIndex(({id}) => id === currentLayerId);
    currentLayer = layers[currentLayerIndex].data;
}


const Canvas = forwardRef(({  onCanvasUpdated, dataUrl, currentFrameID }, ref) => {
    const classes = useStyles();
    useImperativeHandle(ref, () => {
        return {
            drawScene,
            setMode: (data) => mode = data,
            setColor: (data) => color = data,
            setBrush: (data) => brushSize = data,
            setOpacity: (data) => opacity = data,
            setCurrentLayer: (data) => { currentLayerId = data; updateCurrentLayerIndex(); },
            clearScene,
            clearCurrentFrame: () => {
                clearScene();
            }
        };
    });

    const clearScene = () => {
        currentLayer.destroyChildren();
        supportLayerBefore.destroyChildren();
        supportLayerAfter.destroyChildren();
        supportLayerBefore.batchDraw();
        supportLayerAfter.batchDraw();
        currentLayer.batchDraw();
        onCanvasUpdated(currentLayer.toDataURL())
    }

    const drawImage = async (dataUrl, layer, data = {}) => {
        const imageObj = new Image();
        imageObj.onload = () => {
            layer.destroyChildren();
            const image = new Konva.Image({
                x: 0,
                y: 0,
                image: imageObj,
                ...data
            });
            //image.cache();
            layer.add(image);
            layer.batchDraw();
        };
        imageObj.src = dataUrl;
    }

    const drawScene = async (layersArr, before = [], after = []) => {
        layers = []
        stage.destroyChildren();
        addSupportLayers();

        layersArr.forEach(({id, dataUrl}) => {
            const konvaLayer = new Konva.Layer();
            stage.add(konvaLayer);
            layers.push({id, data: konvaLayer});
            if(dataUrl) {
                drawImage(dataUrl, konvaLayer);
            }
        });
        before.forEach((dataUrl, index) => {
            drawImage(dataUrl, supportLayerBefore, { opacity: 0.1 });
        });
        after.forEach((dataUrl, index) => {
            drawImage(dataUrl, supportLayerAfter, { opacity: 0.1 })
        });
    }

    const addSupportLayers = () => {
        supportLayerBefore = new Konva.Layer();
        supportLayerAfter = new Konva.Layer();
        stage.add(supportLayerBefore);
        stage.add(supportLayerAfter);
    }

    const initCanvas = () => {
        stage = new Konva.Stage({
            container: DRAW_CONTAINER_ID,
            width: 1024,
            height: 600
        });
        const newLayer = new Konva.Layer();
        layers[currentLayerIndex].data = newLayer;
        currentLayer = newLayer;
        stage.add(currentLayer);
        addSupportLayers();
        //drawScene(dataUrl);
    }


    const draw = (evt) => {
        if (!isPaint) {
            return;
        }

        // prevent scrolling on touch devices
        evt?.preventDefault();
        const rect = document.querySelector(`#${DRAW_CONTAINER_ID}`).getBoundingClientRect();
        const pos = evt ? {
            x: (evt.clientX || evt.touches?.[0].clientX) - rect.left,
            y: (evt.clientY || evt.touches?.[0].clientY) - rect.top
        } : stage.getPointerPosition();
        console.log('evt', evt);
        var newPoints = lastLine.points().concat([pos.x, pos.y]);
        lastLine.points(newPoints);
        currentLayer.batchDraw();
    }

    const startDrawing = () => {
        isPaint = true;
        const pos = stage.getPointerPosition();
        lastLine = new Konva.Line({
            stroke: color,
            opacity,
            strokeWidth: brushSize,
            bezier: true,
            globalCompositeOperation:
                mode === 'brush' ? 'source-over' : 'destination-out',
            // round cap for smoother lines
            lineCap: 'round',
            lineJoin: 'round',
            points: [pos.x, pos.y],
        });
        currentLayer.add(lastLine);
        currentLayer.batchDraw();
        draw();
        draw();
    }

    const endDrawing = () => {
        isPaint = false;
        onCanvasUpdated(currentLayer.toDataURL())
    }

    useEffect(() => {
        initCanvas();
        stage.on('mousedown touchstart', startDrawing);
        document.body.addEventListener('mousemove', draw);
        document.body.addEventListener('touchmove', draw);
        document.body.addEventListener('mouseup', endDrawing);
        document.body.addEventListener('touchend', endDrawing);
    }, []);

    return <div
        id={DRAW_CONTAINER_ID}
        className={clsx(classes.paper, classes.scene)}
    />
});

export default memo(Canvas);