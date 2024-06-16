import React, { useEffect, useState, useRef, useReducer } from 'react';
import { useStyles } from './Editor.styles';
import Konva from 'konva';
import RoundButton from '../shared/RoundButton/RoundButton';
import { ReactComponent as TrashIcon } from '../../shared/icons/trash.svg';
import { ReactComponent as SaveIcon } from '../../shared/icons/save.svg';
import { ReactComponent as ColorIcon } from '../../shared/icons/color.svg';
import { ReactComponent as PenIcon } from '../../shared/icons/pen.svg';
import { ReactComponent as EraserIcon } from '../../shared/icons/eraser.svg';
import { ReactComponent as PlayIcon } from '../../shared/icons/play.svg';
import { ReactComponent as PauseIcon } from '../../shared/icons/pause.svg';

import Frames from './Frames/Frames';
import * as uuid from 'uuid';
import { Stage, Layer, Rect, Circle, Image as KonvaImage } from 'react-konva';

const STAGE_WIDTH = 1024;
const STAGE_HEIGHT = 600;

const framesData =  ['']

const insertItemByIndex = (arr, index, newItem) => [
  ...arr.slice(0, index),
  newItem,
  ...arr.slice(index)
]

const initialState = {
  framesData,
  currentFrameIndex: 0,
  currentFrame: framesData[0],
  isPlay: false
};

const editorActionTypes = {
  ADD_FRAME: 'ADD_FRAME',
  SELECT_FRAME: 'SELECT_FRAME',
  TOGGLE_PLAY: 'TOGGLE_PLAY',
  SAVE_FRAME: 'SAVE_FRAME'
}

const reducer = (state, action) => {
  let newFramesData = state.framesData;

  switch (action.type) {
    case editorActionTypes.ADD_FRAME:
      newFramesData[state.currentFrameIndex] = action.payload.frameData;
      newFramesData = insertItemByIndex(state.framesData, state.currentFrameIndex + 1, '');
      return {
        ...state,
        currentFrameIndex: state.currentFrameIndex + 1,
        currentFrame: '',
        framesData: [...newFramesData]
      };
    case editorActionTypes.SELECT_FRAME:
      if(!state.isPlay && action.payload.frameData) {
        newFramesData[state.currentFrameIndex] = action.payload.frameData;
      }
      return {
        ...state,
        currentFrameIndex: action.payload.index,
        currentFrame: newFramesData[action.payload.index],
        framesData: [...newFramesData],
      };
    case editorActionTypes.SAVE_FRAME:
      newFramesData[state.currentFrameIndex] = action.payload.frameData;
      return {
        ...state,
        framesData: [...newFramesData],
      };
    case editorActionTypes.TOGGLE_PLAY:
      let isPlay = state.framesData.length > 1 ? !state.isPlay : false;
      console.log('isPlay', isPlay);
      return {
        ...state,
        isPlay
      };
    default:
      throw new Error();
  }
};

const Editor = () => {
  const classes = useStyles();
  const [state, dispatch] = useReducer(reducer, initialState);
  const {framesData, currentFrameIndex, currentFrame, isPlay } = state;

  const stageRef = useRef();
  const imageRef = useRef();
  const layerRef = useRef();

  let isDrawing = false;
  let lastPointerPosition;
  let currentTick = 0;

  const canvas = document.createElement('canvas');
  canvas.width = STAGE_WIDTH;
  canvas.height = STAGE_HEIGHT;
  const context = canvas.getContext('2d');
  context.strokeStyle = '#000';
  context.lineJoin = 'round';
  context.lineWidth = 10;

  const addFrame = () => {
    const payload = {
      frameData: imageRef?.current?.toDataURL({mimeType:'image/png'})
    }
    dispatch({type: editorActionTypes.ADD_FRAME, payload})
  }

  const setSelectedFrame = (index) => {
    const payload = {
      frameData: isPlay ? null : imageRef?.current?.toDataURL({mimeType:'image/png'}),
      index
    }
    dispatch({type: editorActionTypes.SELECT_FRAME, payload});
  }

  const saveFrameData = () => {
    const payload = {
      frameData: imageRef?.current?.toDataURL({mimeType:'image/png'}),
    }
    dispatch({type: editorActionTypes.SAVE_FRAME, payload});
  }

  let isImageLoaded = false;

  const tick = () => {
    if(isPlay) {
      const nextFrameIndex = currentFrameIndex < framesData.length - 1 ? currentFrameIndex + 1 : 0;
      setSelectedFrame(nextFrameIndex);
    }
  }

  const toggleIsPlay = () => {
    dispatch({type: editorActionTypes.TOGGLE_PLAY});
  }

  useEffect(() => {
    if(currentFrame) {
      const layer = layerRef && layerRef.current;
      const img = new Image;
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
        layer.batchDraw();
        isImageLoaded = true;
      };
      img.src = currentFrame;
    }
  }, [state]);

  useEffect(() => {
    console.log('is play changed now it is', isPlay)
    if(isPlay) {
      setTimeout(() => tick(), 60)
    }
  }, [isPlay, currentFrameIndex]);

  useEffect(() => {
    const stage = stageRef && stageRef.current;
    const image = imageRef && imageRef.current;
    const layer = layerRef && layerRef.current;

    if (stage && image && layer) {

      document.body.addEventListener('pointerdown', function (evt) {
        isDrawing = true;
        lastPointerPosition = stage.getPointerPosition();
      });

      document.body.addEventListener('pointerup', function () {
        isDrawing = false;
      });

      const draw = (evt) => {
        if (!isDrawing) return;

        context.lineWidth = (evt.pressure || 1) * 15;
        context.globalCompositeOperation = 'source-over';
        context.beginPath();

        lastPointerPosition = lastPointerPosition || stage.getPointerPosition();

        let localPos = {
          x: lastPointerPosition.x - image.x(),
          y: lastPointerPosition.y - image.y()
        };

        context.moveTo(localPos.x, localPos.y);
        const pos = stage.getPointerPosition();
        localPos = {
          x: pos.x - image.x(),
          y: pos.y - image.y()
        };
        context.lineTo(localPos.x, localPos.y);
        context.closePath();
        context.stroke();

        lastPointerPosition = pos;
        layer.batchDraw();
      }

      document.body.addEventListener('pointermove', draw);

    }
  });
  console.log('isPlay', isPlay);
  return <div className={classes.container}>
    <div className={classes.workArea}>
      <div className={classes.tools}>
        <RoundButton onClick={() => addFrame()}>+</RoundButton>
        <RoundButton><TrashIcon/></RoundButton>
        <RoundButton><SaveIcon/></RoundButton>
      </div>
      <Stage className={classes.paper} width={STAGE_WIDTH} height={STAGE_HEIGHT} ref={stageRef}>
          <Layer ref={layerRef}>
            <KonvaImage
              image={canvas}
              ref={imageRef}
            />
          </Layer>
      </Stage>
      <div className={classes.tools}>
        <RoundButton><PenIcon/></RoundButton>
        <RoundButton><EraserIcon/></RoundButton>
        <RoundButton><ColorIcon/></RoundButton>
      </div>
    </div>
    <Frames currentFrameIndex={currentFrameIndex} frames={framesData} setSelectedFrame={setSelectedFrame}/>
    <div className={classes.controls}>
      <RoundButton onClick={() => toggleIsPlay()}>{isPlay ? <PauseIcon/> : <PlayIcon/>}</RoundButton>
    </div>
  </div>
};

export default Editor;