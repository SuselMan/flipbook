import React, { useEffect, useState, useRef } from 'react';
import { useStyles } from './Editor.styles';
import clsx from 'clsx';
import RoundButton from '../shared/RoundButton/RoundButton';
import {ReactComponent as TrashIcon} from '../../shared/icons/trash.svg';
import {ReactComponent as SaveIcon} from '../../shared/icons/save.svg';
import {ReactComponent as PenIcon} from '../../shared/icons/pen.svg';
import {ReactComponent as EraserIcon} from '../../shared/icons/eraser.svg';
import {ReactComponent as PlayIcon} from '../../shared/icons/play.svg';
import {ReactComponent as PauseIcon} from '../../shared/icons/pause.svg';
import {ReactComponent as DuplicateIcon} from '../../shared/icons/duplicate.svg';
import {ReactComponent as MultipleIcon} from '../../shared/icons/multiple.svg';
import {ReactComponent as ClearIcon} from '../../shared/icons/clear.svg';
import {ReactComponent as UndoIcon} from '../../shared/icons/redo.svg';
import {ReactComponent as RedoIcon} from '../../shared/icons/undo.svg';
import {ReactComponent as AddLayerIcon} from '../../shared/icons/add-layer.svg';

import { stringNames, getString } from '../../configs/strings';
import Layers from './Layers/Layers';
import Canvas from "./Canvas/Canvas";
import Color from './Tools/Color/Color';
import BrushSize from './Tools/BrushSize/BrushSize';
import Opacity from './Tools/Opacity/Opacity';
import Shortcuts from '../../modules/Shortcuts/Shortcuts';
import { SHORTCUTS } from '../../configs/shortcuts';
import useStateRef from 'react-usestateref';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { TOOLS } from './Editor.constants';
import {
  currentLayerAtom,
  isPlayAtom,
  isOnionSkinAtom,
  selectedToolAtom,
  selectedColorAtom,
  brushSizeAtom,
  opacityAtom,
  isColorPickingAtom,
  isOpacityPickingAtom,
  isBrushSizePickingAtom,
  currentFrameAtom,
  frameSelector,
  addLayerSelector,
  getSliceSelector,
  nextFrameSelector,
  currentIndexAtom,
  clearFrameSelector,
} from './Editor.state';

const Editor = () => {
  const classes = useStyles();
  const canvasRef = useRef();
  const [isPlay, setIsPlay] = useRecoilState(isPlayAtom);
  const [currentFrame, setCurrentFrame] = useRecoilState(currentFrameAtom);
  const [currentIndex] = useRecoilState(currentIndexAtom);
  const [slice] = useRecoilState(getSliceSelector);
  const [currentLayer, setCurrentLayer] = useRecoilState(currentLayerAtom);
  const [ isMultiple, setIsMultiple] = useRecoilState(isOnionSkinAtom);
  const [tool, setTool] = useRecoilState(selectedToolAtom);
  const [currentColor, setCurrentColor] = useRecoilState(selectedColorAtom);
  const [isTooltipOpen, setIsTooltipOpen] = useRecoilState(isColorPickingAtom);
  const setFrame = useSetRecoilState(frameSelector(currentFrame));
  const addLayer = useSetRecoilState(addLayerSelector);
  const nextFrame = useSetRecoilState(nextFrameSelector);
  const [isBrushTooltipOpen, setIsBrushTooltipOpen] = useRecoilState(isBrushSizePickingAtom);
  const [isOpacityTooltipOpen, setIsOpacityTooltipOpen] = useRecoilState(isOpacityPickingAtom);
  const [brushSize, setBrushSize] = useRecoilState(brushSizeAtom);
  const [opacity, setOpacity] = useRecoilState(opacityAtom);
  const clearFrame = useSetRecoilState(clearFrameSelector);

  useEffect(() => {
    canvasRef.current.setMode(tool);
  }, [tool]);

  useEffect(() => {
    canvasRef.current.drawScene(slice);
    canvasRef.current.setCurrentLayer(currentLayer);
  }, [currentFrame, currentIndex]);

  useEffect(() => {
    if(isPlay) {
      const timeout = setTimeout(() => {
        nextFrame();
        clearTimeout(timeout);
      }, 100);
    }
  }, [isPlay, currentIndex]);


  useEffect(() => {
    console.log('currentFrame changed', currentFrame);
    // Shortcuts.on(SHORTCUTS.UNDO, undo);
    // Shortcuts.on(SHORTCUTS.REDO, redo);
    // Shortcuts.on(SHORTCUTS.CLEAR_FRAME, clearFrame);
    // Shortcuts.on(SHORTCUTS.DUPLICATE_FRAME, duplicateFrame);
    // Shortcuts.on(SHORTCUTS.ONION_SKIN_TOOL, () => setIsMultiple(!isMultipleRef.current));
    // Shortcuts.on(SHORTCUTS.ADD_FRAME, addFrame);
    // Shortcuts.on(SHORTCUTS.REDUCE_BRUSH, reduceBrush);
    // Shortcuts.on(SHORTCUTS.INCREASE_BRUSH, increaseBrush);
    // Shortcuts.on(SHORTCUTS.PLAY_PAUSE,  togglePlay);
    // Shortcuts.on(SHORTCUTS.BRUSH_TOOL, () => setTool(TOOLS.BRUSH));
    // Shortcuts.on(SHORTCUTS.ERASER_TOOL, () => setTool(TOOLS.ERASER));
    // Shortcuts.on(SHORTCUTS.DELETE_FRAME,  deleteFrame);
    // Shortcuts.on(SHORTCUTS.NEXT_FRAME, () => framesRef.current.selectNextFrame());
    // Shortcuts.on(SHORTCUTS.PREVIOUS_FRAME, () => framesRef.current.selectPreviousFrame());
  }, []);

  const onCanvasUpdated = (dataUrl) => {
    setFrame({ dataUrl });
  }

  const undo = () => {};
  const redo = () => {};
  const addFrame = () => {};
  const duplicateFrame = () => {};
  const togglePlay = () => {
    setIsPlay(!isPlay);
  };
  const deleteFrame = () => {};

  const pickColor = (color) => {
    setCurrentColor(color.hex);
    canvasRef.current.setColor(color.hex);
    setIsTooltipOpen(false);
  }

  const setBrush = (size) => {
    setBrushSize(size);
    canvasRef.current.setBrush(size);
  }
  const setOpacityValue = (value) => {
    setOpacity(value);
    canvasRef.current.setOpacity(value);
  }

  const onClearFrame = () => {
    canvasRef.current.clearCurrentFrame();
  }

  return <div className={classes.container}>
    <div className={classes.workArea}>
      <div className={clsx(classes.tools, classes.leftTools)}>
        <RoundButton title={getString(stringNames.saveToolTitle)}><SaveIcon/></RoundButton>
        <RoundButton onClick={() => undo()} title={getString(stringNames.undoToolTitle)}><UndoIcon/></RoundButton>
        <RoundButton onClick={() => redo()} title={getString(stringNames.redoToolTitle)}><RedoIcon/></RoundButton>
      </div>
      <Canvas
          onCanvasUpdated={(data) => onCanvasUpdated(data)}
          tool={tool}
          ref={canvasRef}
      />
      <div className={clsx(classes.tools, classes.rightTools)}>
        <RoundButton
            title={getString(stringNames.brushToolTitle)}
            onClick={() => setTool(TOOLS.BRUSH)}
            isPressed={tool === TOOLS.BRUSH}
        >
          <PenIcon/>
        </RoundButton>
        <RoundButton
            title={getString(stringNames.eraserToolTitle)}
            onClick={() => setTool(TOOLS.ERASER)}
            isPressed={tool === TOOLS.ERASER}
        >
          <EraserIcon/>
        </RoundButton>
        <Color
          isTooltipOpen={isTooltipOpen}
          setIsTooltipOpen={setIsTooltipOpen}
          currentColor={currentColor}
          pickColor={pickColor}
        />
        <BrushSize
            brushSize={brushSize}
            setIsBrushTooltipOpen={setIsBrushTooltipOpen}
            currentColor={currentColor}
            isBrushTooltipOpen={isBrushTooltipOpen}
            setBrush={setBrush}
        />
        <Opacity
            currentColor={currentColor}
            opacity={opacity}
            setOpacityValue={setOpacityValue}
            isOpacityTooltipOpen={isOpacityTooltipOpen}
            setIsOpacityTooltipOpen={setIsOpacityTooltipOpen}
        />
      </div>
    </div>
    <div className={classes.bottomTools}>
      <RoundButton title={getString(stringNames.addFrameToolTitle)} onClick={() => {addFrame()}}>+</RoundButton>
      <RoundButton title={getString(stringNames.addFrameToolTitle)} onClick={() => {addLayer()}}><AddLayerIcon/></RoundButton>
      <RoundButton title={getString(stringNames.duplicateFrameToolTitle)} onClick={() => {duplicateFrame()}}><DuplicateIcon/></RoundButton>
      <RoundButton title={getString(stringNames.playPauseToolTitle)} onClick={() => {togglePlay()}}>{ isPlay ? <PauseIcon/> : <PlayIcon/>}</RoundButton>
      <RoundButton title={getString(stringNames.deleteFrameToolTitle)} onClick={() => {deleteFrame()}}><TrashIcon/></RoundButton>
      <RoundButton title={getString(stringNames.onionSkinToolTitle)} isPressed={isMultiple} onClick={() => {setIsMultiple(!isMultiple)}}><MultipleIcon/></RoundButton>
      <RoundButton title={getString(stringNames.clearToolTitle)} onClick={() => {onClearFrame()}}><ClearIcon/></RoundButton>
    </div>
    <Layers/>
  </div>
};

export default Editor;