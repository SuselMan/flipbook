import React, { memo, useState, useImperativeHandle, useEffect, forwardRef } from 'react';
import { useStyles } from './Canvas.styles';
import clsx from 'clsx';
import Konva from 'konva';
import { initialLayer } from "../Editor.state";
import {TOOLS} from "../Editor.constants";

let isPaint = false;
let mode = 'brush';
let stage;
let layers = [ { id: initialLayer.id, data: null, isVisible: true } ];
let currentLayerId = initialLayer.id;
let currentLayerIndex = 0;
let currentLayer = null;

let supportLayerBefore = null;
let supportLayerAfter = null;
let lastLine;
let color = '#ff00a2';
let brushSize = 5;
let opacity = 1;
const DRAW_CONTAINER_ID = 'drawContainer';
let moveOffset = {x: 0, y: 0};
let startMovePosition = {x: 0, y: 0};
let currentZoom = 1;

const updateCurrentLayerIndex = () => {
    currentLayerIndex = layers.findIndex(({id}) => id === currentLayerId);
    currentLayer = layers[currentLayerIndex]?.data;
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
            zoomIn: () => setZoom(currentZoom + .1),
            zoomOut: () => setZoom(currentZoom - .1),
        };
    });

    const setZoom = (zoom) => {
        currentZoom = zoom;
        stage.scaleX(zoom);
        stage.scaleY(zoom);
        stage.batchDraw();
    }

    const clearScene = (silent) => {
        currentLayer.destroyChildren();
        supportLayerBefore.destroyChildren();
        supportLayerAfter.destroyChildren();
        supportLayerBefore.batchDraw();
        supportLayerAfter.batchDraw();
        currentLayer.batchDraw();
        if(!silent) {
            onCanvasUpdated(currentLayer.toDataURL())
        }
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
        console.log('drawScene');
        layers = []
        stage.destroyChildren();
        addPaper();
        addSupportLayers();

        layersArr.forEach(({id, dataUrl, isVisible}) => {
            const konvaLayer = new Konva.Layer();
            stage.add(konvaLayer);
            layers.push({id, data: konvaLayer, isVisible });
            if(dataUrl && isVisible) {
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

    const addPaper = () => {
        const layer = new Konva.Layer();
        const rect = new Konva.Rect({
            x: window.innerWidth/2 - 1024/2,
            y: 120,
            width: 1024,
            height: 600,
            fill: 'white',
            shadowColor: 'black',
            shadowBlur: 0,
            shadowOffset: { x: 2, y: 2 },
            shadowOpacity: 0.02,
        });
        layer.add(rect);
        stage.add(layer);
    }

    const initCanvas = () => {
        stage = new Konva.Stage({
            container: DRAW_CONTAINER_ID,
            width: window.innerWidth,
            height: window.innerHeight,
        });
        const newLayer = new Konva.Layer();
        layers[currentLayerIndex].data = newLayer;
        currentLayer = newLayer;
        stage.add(currentLayer);
        addPaper()
        addSupportLayers();
    }


    const draw = (evt) => {
        if (isPaint && (layers[currentLayerIndex].isVisible || mode === TOOLS.MOVE_SCREEN)) {

            const x = evt.clientX || evt.touches?.[0].clientX;
            const y = evt.clientY || evt.touches?.[0].clientY;

            if (mode === TOOLS.MOVE_SCREEN) {
                moveOffset = {
                    x: startMovePosition.x - x,
                    y: startMovePosition.y - y,
                }
                stage.offsetX(moveOffset.x);
                stage.offsetY(moveOffset.y);
                stage.batchDraw();
                return;
            }
            // prevent scrolling on touch devices
            evt?.preventDefault();
            const rect = document.querySelector(`#${DRAW_CONTAINER_ID}`).getBoundingClientRect();
            const pos = evt ? {
                x: x + moveOffset.x - rect.left,
                y: y + moveOffset.y - rect.top
            } : stage.getPointerPosition();
            var newPoints = lastLine.points().concat([pos.x, pos.y]);
            lastLine.points(newPoints);
            currentLayer.batchDraw();
        }
    }

    const startDrawing = (e) => {
        if(mode === TOOLS.MOVE_SCREEN) {
            const evt = e.evt;
            const x = (evt.clientX || evt.touches?.[0].clientX);
            const y = (evt.clientY || evt.touches?.[0].clientY);
            startMovePosition = {x,y};
            isPaint = true;
            return;
        }
        if(!layers[currentLayerIndex].isVisible) {
            isPaint = false;
            return;
        }
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
            points: [pos.x + + moveOffset.x, pos.y + + moveOffset.y],
        });
        currentLayer.add(lastLine);
        currentLayer.batchDraw();
        draw(e.evt);
        draw(e.evt);
    }

    const endDrawing = () => {
        if(isPaint && layers[currentLayerIndex].isVisible) {
            onCanvasUpdated(currentLayer.toDataURL())
        }
        isPaint = false;
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