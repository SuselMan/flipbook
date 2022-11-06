import React, { useEffect, useState, useRef } from 'react';
import { useStyles } from './Editor.styles';
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
import { stringNames, getString } from '../../configs/strings';
import { TOOLS } from './Editor.constants';
import Frames from './Frames/Frames';
import Canvas from "./Canvas/Canvas";
import Color from './Tools/Color/Color';
import BrushSize from './Tools/BrushSize/BrushSize';
import Opacity from './Tools/Opacity/Opacity';
import Shortcuts from '../../modules/Shortcuts/Shortcuts';
import { SHORTCUTS } from '../../configs/shortcuts';
import useStateRef from 'react-usestateref';

const Editor = () => {
  const classes = useStyles();
  const framesRef = useRef();
  const canvasRef = useRef();
  const [isPlay, setIsPlay] = useState(false);
  const [ isMultiple, setIsMultiple, isMultipleRef] = useStateRef(false);
  const [tool, setTool] = useState(TOOLS.BRUSH)
  const [currentColor, setCurrentColor] = useState('#000');
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [isBrushTooltipOpen, setIsBrushTooltipOpen] = useState(false);
  const [isOpacityTooltipOpen, setIsOpacityTooltipOpen] = useState(false);
  const [brushSize, setBrushSize, brushSizeRef] = useStateRef(5);
  const [opacity, setOpacity] = useStateRef(1);

  const updateFrames = (dataUrl) => {
    framesRef.current.updateFrames(dataUrl);
  }

  const addFrame = (dataUrl) => {
    framesRef.current.addFrame(dataUrl);
  }

  const deleteFrame = () => {
    framesRef.current.deleteFrame();
  }

  const setCurrentFrameData = (dataUrl, before, after) => {
    drawImage(dataUrl, before, after);
  }

  const togglePlay = () => {
    framesRef.current.togglePlay();
  }

  const duplicateFrame = () => {
    framesRef.current.duplicateFrame();
  }

  const drawImage = (dataUrl, before, after) => {
    canvasRef.current.drawImage(dataUrl, before, after);
  }

  const clearFrame = () => {
    canvasRef.current.clearScene();
  }

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

  const undo = () => {
    console.log('undo');
    framesRef.current.undo();
  }

  const redo = () => {
    console.log('redo');
    framesRef.current.redo();
  }

  const reduceBrush = () => {
    let newSIze = brushSizeRef.current - 1;
    if(newSIze < 1) newSIze = 1;
    setBrush(newSIze)
  }

  const increaseBrush = () => {
    let newSIze = brushSizeRef.current + 1;
    if(newSIze > 100) newSIze = 100;
    setBrush(newSIze)
  }

  useEffect(() => {
    canvasRef.current.setMode(tool);
  }, [tool]);

  useEffect(() => {
    Shortcuts.on(SHORTCUTS.UNDO, undo);
    Shortcuts.on(SHORTCUTS.REDO, redo);
    Shortcuts.on(SHORTCUTS.CLEAR_FRAME, clearFrame);
    Shortcuts.on(SHORTCUTS.DELETE_FRAME, duplicateFrame);
    Shortcuts.on(SHORTCUTS.ONION_SKIN_TOOL, () => setIsMultiple(!isMultipleRef.current));
    Shortcuts.on(SHORTCUTS.ADD_FRAME, addFrame);
    Shortcuts.on(SHORTCUTS.REDUCE_BRUSH, reduceBrush);
    Shortcuts.on(SHORTCUTS.INCREASE_BRUSH, increaseBrush);
    Shortcuts.on(SHORTCUTS.PLAY_PAUSE,  togglePlay);
    Shortcuts.on(SHORTCUTS.BRUSH_TOOL, () => setTool(TOOLS.BRUSH));
    Shortcuts.on(SHORTCUTS.ERASER_TOOL, () => setTool(TOOLS.ERASER));
    Shortcuts.on(SHORTCUTS.DELETE_FRAME,  deleteFrame);
    Shortcuts.on(SHORTCUTS.NEXT_FRAME, () => framesRef.current.selectNextFrame());
    Shortcuts.on(SHORTCUTS.PREVIOUS_FRAME, () => framesRef.current.selectPreviousFrame());
  }, []);

  return <div className={classes.container}>
    <div className={classes.workArea}>
      <div className={classes.tools}>
        <RoundButton title={getString(stringNames.saveToolTitle)}><SaveIcon/></RoundButton>
        <RoundButton onClick={() => undo()} title={getString(stringNames.undoToolTitle)}><UndoIcon/></RoundButton>
        <RoundButton onClick={() => redo()} title={getString(stringNames.redoToolTitle)}><RedoIcon/></RoundButton>
      </div>
      <Canvas
          updateFrames={updateFrames}
          tool={tool}
          ref={canvasRef}
      />
      <div className={classes.tools}>
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
    <Frames
        ref={framesRef}
        setCurrentFrameData={setCurrentFrameData}
        setIsPlay={setIsPlay}
        isPlay={isPlay}
        isMultiple={isMultiple}
    />
    <div className={classes.bottomTools}>
      <RoundButton title={getString(stringNames.addFrameToolTitle)} onClick={() => {addFrame()}}>+</RoundButton>
      <RoundButton title={getString(stringNames.duplicateFrameToolTitle)} onClick={() => {duplicateFrame()}}><DuplicateIcon/></RoundButton>
      <RoundButton title={getString(stringNames.playPauseToolTitle)} onClick={() => {togglePlay()}}>{ isPlay ? <PauseIcon/> : <PlayIcon/>}</RoundButton>
      <RoundButton title={getString(stringNames.deleteFrameToolTitle)} onClick={() => {deleteFrame()}}><TrashIcon/></RoundButton>
      <RoundButton title={getString(stringNames.onionSkinToolTitle)} isPressed={isMultiple} onClick={() => {setIsMultiple(!isMultiple)}}><MultipleIcon/></RoundButton>
      <RoundButton title={getString(stringNames.clearToolTitle)} onClick={() => {clearFrame()}}><ClearIcon/></RoundButton>
    </div>
  </div>
};

export default Editor;