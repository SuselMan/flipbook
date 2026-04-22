import React, { useRef, useLayoutEffect } from 'react';
import { useEditorStore } from '../../../stores/editorStore';
import { getBitmap, PAPER_DIMENSIONS } from '../../../modules/playEngine/playEngine';
import { HEADER_HEIGHT } from '../../Header/Header.styles';

const { width: PAPER_WIDTH, height: PAPER_HEIGHT } = PAPER_DIMENSIONS;
const PAPER_Y = 120; // must match Canvas.jsx PAPER_Y
const PAPER_TOP_VIEWPORT = HEADER_HEIGHT + PAPER_Y;

const PlayCanvas = () => {
    const canvasRef = useRef();
    const currentIndex = useEditorStore((s) => s.currentIndex);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const bitmap = getBitmap(currentIndex);
        if (bitmap) {
            ctx.drawImage(bitmap, 0, 0, PAPER_WIDTH, PAPER_HEIGHT);
        } else {
            // cache miss — keep previous pixels; if first render, paint white
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, PAPER_WIDTH, PAPER_HEIGHT);
        }
    }, [currentIndex]);

    return <canvas
        ref={canvasRef}
        width={PAPER_WIDTH}
        height={PAPER_HEIGHT}
        style={{
            position: 'fixed',
            top: PAPER_TOP_VIEWPORT,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'white',
            boxShadow: '20px 20px 41px #dddfe2, -20px -20px 41px #f9fbfe',
            borderRadius: 3,
            zIndex: 10,
            pointerEvents: 'none',
        }}
    />;
};

export default PlayCanvas;
