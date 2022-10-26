import React, { useEffect, useState, useRef } from 'react';
import { useStyles } from './Editor.styles';
import RoundButton from '../shared/RoundButton/RoundButton';
import {ReactComponent as TrashIcon} from '../../shared/icons/trash.svg';
import {ReactComponent as SaveIcon} from '../../shared/icons/save.svg';
import {ReactComponent as ColorIcon} from '../../shared/icons/color.svg';
import {ReactComponent as PenIcon} from '../../shared/icons/pen.svg';
import {ReactComponent as EraserIcon} from '../../shared/icons/eraser.svg';
import {ReactComponent as PlayIcon} from '../../shared/icons/play.svg';
import {ReactComponent as PauseIcon} from '../../shared/icons/pause.svg';
import {ReactComponent as DuplicateIcon} from '../../shared/icons/duplicate.svg';
import {ReactComponent as MultipleIcon} from '../../shared/icons/multiple.svg';
import {ReactComponent as ClearIcon} from '../../shared/icons/clear.svg';
import {ReactComponent as BrushSizeIcon} from '../../shared/icons/brush-size.svg';
import {ReactComponent as OpacityIcon} from '../../shared/icons/opacity.svg';
import {ReactComponent as UndoIcon} from '../../shared/icons/undo.svg';
import {ReactComponent as RedoIcon} from '../../shared/icons/redo.svg';
import { stringNames, getString } from '../../configs/strings';
import { TOOLS } from './Editor.constants';
import Frames from './Frames/Frames';
import Canvas from "./Canvas/Canvas";
import { BlockPicker } from 'react-color';
import Tooltip from '@mui/material/Tooltip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Slider from '@mui/material/Slider';

const Editor = () => {
  const classes = useStyles();
  const framesRef = useRef();
  const canvasRef = useRef();
  const [isPlay, setIsPlay] = useState(false);
  const [ isMultiple, setIsMultiple ] = useState(false);
  const [tool, setTool] = useState(TOOLS.BRUSH)
  const [currentColor, setCurrentColor] = useState('#000');
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [isBrushTooltipOpen, setIsBrushTooltipOpen] = useState(false);
  const [isOpacityTooltipOpen, setIsOpacityTooltipOpen] = useState(false);
  const [brushSize, setBrushSize] = useState(5);
  const [opacity, setOpacity] = useState(1);

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

  useEffect(() => {
    canvasRef.current.setMode(tool);
  }, [tool]);


  return <div className={classes.container}>
    <div className={classes.workArea}>
      <div className={classes.tools}>
        <RoundButton title={getString(stringNames.saveToolTitle)}><SaveIcon/></RoundButton>
        <RoundButton title={getString(stringNames.undoToolTitle)}><UndoIcon/></RoundButton>
        <RoundButton title={getString(stringNames.redoToolTitle)}><RedoIcon/></RoundButton>
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
        <Tooltip
          title={
            <div className={classes.colorPicker}>
              <BlockPicker
                  triangle={'hide'}
                  color={ currentColor }
                  onChangeComplete={ pickColor }
              />
            </div>
          }
          PopperProps={{
            disablePortal: true,
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [-20, -30],
                }
              },
            ],
          }}
          componentsProps={{
            tooltip: {
              sx: {
                bgcolor: currentColor,
                '& .MuiTooltip-arrow': {
                  color: currentColor,
                },
                padding: '0px',
                borderRadius: '8px'
              },
            },
          }}
          placement="left"
          open={isTooltipOpen}
          disableFocusListener
          disableHoverListener
          disableTouchListener
        >
          <div>
            <ClickAwayListener onClickAway={() => setIsTooltipOpen(false)}>
              <div>
                <RoundButton
                    title={getString(stringNames.paletteToolTitle)}
                    onClick={() => setIsTooltipOpen(!isTooltipOpen)}
                    isPressed={isTooltipOpen}
                >
                  <ColorIcon/>
                </RoundButton>
              </div>
            </ClickAwayListener>
          </div>
        </Tooltip>
        <Tooltip
            title={
              <div className={classes.slider}>
                <Slider
                    aria-label="Volume"
                    value={brushSize}
                    color="secondary"
                    min={1}
                    max={100}
                    onChange={(e, newValue) => setBrush(Number(newValue))} />
              </div>
            }
            PopperProps={{
              disablePortal: true,
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [0, -30],
                  }
                },
              ],
            }}
            componentsProps={{
              tooltip: {
                sx: {
                  padding: '0px',
                  borderRadius: '8px',
                },
              },
            }}
            placement="left"
            open={isBrushTooltipOpen}
            disableFocusListener
            disableHoverListener
            disableTouchListener
        >
          <div>
            <ClickAwayListener onClickAway={() => setIsBrushTooltipOpen(false)}>
              <div>
                <RoundButton
                    title={getString(stringNames.brushSizeToolTitle)}
                    iconColor={currentColor}
                    onClick={() => {
                      console.log(isBrushTooltipOpen);
                      setIsBrushTooltipOpen(!isBrushTooltipOpen);
                    }}
                    isPressed={isBrushTooltipOpen}
                >
                  <BrushSizeIcon/>
                </RoundButton>
              </div>
            </ClickAwayListener>
          </div>
        </Tooltip>
        <Tooltip
            title={
              <div className={classes.slider}>
                <Slider
                    aria-label="Opacity"
                    value={opacity * 100}
                    color="secondary"
                    min={0}
                    max={100}
                    onChange={(e, newValue) => setOpacityValue(Number(newValue) / 100)} />
              </div>
            }
            PopperProps={{
              disablePortal: true,
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [0, -30],
                  }
                },
              ],
            }}
            componentsProps={{
              tooltip: {
                sx: {
                  padding: '0px',
                  borderRadius: '8px',
                },
              },
            }}
            placement="left"
            open={isOpacityTooltipOpen}
            disableFocusListener
            disableHoverListener
            disableTouchListener
        >
          <div>
            <ClickAwayListener onClickAway={() => setIsOpacityTooltipOpen(false)}>
              <div>
                <RoundButton
                    title={getString(stringNames.opacityToolTitle)}
                    onClick={() => {
                      console.log(isOpacityTooltipOpen);
                      setIsOpacityTooltipOpen(!isOpacityTooltipOpen);
                    }}
                    isPressed={isOpacityTooltipOpen}
                >
                  <OpacityIcon/>
                </RoundButton>
              </div>
            </ClickAwayListener>
          </div>
        </Tooltip>
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