import React, { memo, useState, useImperativeHandle, useEffect, forwardRef } from 'react';
import { useStyles } from './Canvas.styles';
import clsx from 'clsx';
import Konva from 'konva';

let isPaint = false;
let mode = 'brush';
let stage;
let layer = null;
let supportLayerBefore = null;
let supportLayerAfter = null;
let lastLine;
let color = '#000';
let brushSize = 5;
let opacity = 1;

const Canvas = forwardRef(({  updateFrames, dataUrl, currentFrameID }, ref) => {
    const classes = useStyles();
    const DRAW_CONTAINER_ID = 'drawContainer';


    useImperativeHandle(ref, () => {
        return {
            drawImage: drawScene,
            setMode: (data) => mode = data,
            setColor: (data) => color = data,
            setBrush: (data) => brushSize = data,
            setOpacity: (data) => opacity = data,
            clearScene
        }
    });

    const clearScene = () => {
        layer.destroyChildren();
        supportLayerBefore.destroyChildren();
        supportLayerAfter.destroyChildren();
        supportLayerBefore.batchDraw();
        supportLayerAfter.batchDraw();
        layer.batchDraw();
        updateFrames(layer.toDataURL())
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

    const drawScene = async (dataUrl, before = [], after = []) => {
        supportLayerBefore.destroyChildren();
        supportLayerAfter.destroyChildren();
        if(!before.length ) {
            supportLayerBefore.batchDraw();
        }
        if(!after.length) {
            supportLayerAfter.batchDraw();
        }
        if(dataUrl) {
            drawImage(dataUrl, layer);
        } else {
            layer.destroyChildren();
            layer.batchDraw();
        }
        before.forEach((dataUrl, index) => {
            drawImage(dataUrl, supportLayerBefore, { opacity: 0.1 });
        });
        after.forEach((dataUrl, index) => {
            drawImage(dataUrl, supportLayerAfter, { opacity: 0.1 })
        });
    }

    const initCanvas = () => {
        stage = new Konva.Stage({
            container: DRAW_CONTAINER_ID,
            width: 1024,
            height: 600
        });
        layer = new Konva.Layer();
        supportLayerBefore = new Konva.Layer();
        supportLayerAfter = new Konva.Layer();
        stage.add(layer);
        stage.add(supportLayerBefore);
        stage.add(supportLayerAfter);
        drawScene(dataUrl);
    }


    const draw = (evt) => {
        if (!isPaint) {
            return;
        }

        // prevent scrolling on touch devices
        evt?.evt?.preventDefault();

        const pos = stage.getPointerPosition();
        var newPoints = lastLine.points().concat([pos.x, pos.y]);
        lastLine.points(newPoints);
        layer.batchDraw();
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
            // add point twice, so we have some drawings even on a simple click
            points: [pos.x, pos.y, pos.x +10 , pos.y +10],
        });
        layer.add(lastLine);
        layer.batchDraw();
        draw()
    }

    const endDrawing = () => {
        isPaint = false;
        updateFrames(layer.toDataURL())
    }

    useEffect(() => {
        initCanvas();
        stage.on('mousedown touchstart', startDrawing);
        stage.on('mousemove touchmove', draw);
        stage.on('mouseup touchend', endDrawing);
    }, []);

    return <div
        id={DRAW_CONTAINER_ID}
        className={clsx(classes.paper, classes.scene)}
    />
});

export default memo(Canvas);