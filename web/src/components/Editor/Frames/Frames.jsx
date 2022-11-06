import React, {memo, useState, forwardRef, useImperativeHandle, useEffect} from 'react';
import { useStyles } from './Frames.styles';
import clsx from 'clsx';
import Frame from './Frame';
import {getEmptyFrame} from "../Editor.utils";
import {ACTIONS} from "../Editor.constants";

const Frames = forwardRef(({ setCurrentFrameData, isPlay, setIsPlay, isMultiple }, ref) => {
  const classes = useStyles();
  const [currentFrame, setCurrentFrame] = useState(getEmptyFrame(0));
  const [frames, setFrames]= useState([  currentFrame, ]);
  const [multipleLeft, setMultipleLeft] = useState(0);
  const [multipleRight, setMultipleRight] = useState(0);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    let before;
    let after;
    if(isMultiple) {
      before = frames.slice(currentFrame.index - Math.abs(multipleLeft), currentFrame.index).map(({dataUrl}) => dataUrl);
      after = frames.slice(currentFrame.index + 1, currentFrame.index + 1 + multipleRight).map(({dataUrl}) => dataUrl);
    }
    setCurrentFrameData(currentFrame.dataUrl, before, after);
  }, [currentFrame, multipleLeft, multipleRight, isMultiple]);

  useImperativeHandle(ref, () => {
    return {
      updateFrames,
      addFrame,
      deleteFrame,
      duplicateFrame,
      togglePlay,
      undo,
      redo,
      selectNextFrame,
      selectPreviousFrame
    }
  });

  const addHistoryAction = (action) => {
    history.splice(historyIndex + 1, history.length);
    history.push( action );
    setHistory(history);
    setHistoryIndex(historyIndex + 1);
  }

  const selectNextFrame = () => {
    const index = currentFrame.index;
    if(frames[index + 1]) {
      setCurrentFrame(frames[index + 1])
    }
  }

  const selectPreviousFrame = () =>{
    const index = currentFrame.index;
    if(index > 0) {
      setCurrentFrame(frames[index - 1])
    }
  }

  const undo = () => {
    if(historyIndex > -1) {
      const action = history[historyIndex];
      setHistoryIndex(historyIndex - 1);
      switch (action.type) {
        case ACTIONS.FRAME_ADDED:
          deleteFrame(action.data.frame, true);
          break;
        case ACTIONS.FRAME_REMOVED:
          addFrame(action.data.frame, true);
          break;
        case ACTIONS.FRAME_CHANGED:
          replaceFrame(action.data.oldFrame)
          break;
      }
    }
  }

  const redo = () => {
      if(historyIndex < history.length - 1) {
        const newHistoryIndex = historyIndex + 1;
        const action = history[newHistoryIndex];
        setHistoryIndex(historyIndex + 1);
        switch (action.type) {
          case ACTIONS.FRAME_ADDED:
            addFrame(action.data.frame, true);
            break;
          case ACTIONS.FRAME_REMOVED:
            deleteFrame(action.data.frame, true);
            break;
          case ACTIONS.FRAME_CHANGED:
            replaceFrame(action.data.newFrame);
            break;
        }
      }
  }

  const replaceFrame = (frame) => {
    setFrames(frames.map((item) => {
      if(item.id === frame.id) {
        return frame;
      }
      return item;
    }));
    setCurrentFrame(frame);
  }

  const updateFrames = (dataUrl) => {
    const newFrame = { ...currentFrame, dataUrl };
    addHistoryAction({
      type: ACTIONS.FRAME_CHANGED,
      data: {
        oldFrame: { ...currentFrame },
        newFrame,
      },
    });
    setCurrentFrame( newFrame );
    const newFrames = frames.map((frame) => {
      if(frame.id === newFrame.id) {
        return newFrame;
      } else {
        return frame;
      }
    });
    setFrames(newFrames);
  }

  useEffect(() => {
    if(isPlay) {
      const timeout = setTimeout(() => {
        const { index } = currentFrame;
        const newIndex = index + 1;
        if(newIndex < frames.length) {
          setCurrentFrame(frames[newIndex]);
        } else {
          setCurrentFrame(frames[0]);
        }
        clearTimeout(timeout);
      }, 83);
    }
  }, [currentFrame, isPlay]);

  const togglePlay = () => {
    setIsPlay(!isPlay);
  }

  const addFrame = (frame, silent) => {
    const index = frame? frame.index : currentFrame.index + 1;
    let arr = frames;
    const newFrame =  { ...getEmptyFrame(index), ...(frame || {})};
    arr.splice(index, 0, newFrame)
    arr = arr.map((item, index) => ({...item, index}));
    setFrames(arr);
    setCurrentFrame(arr[index]);
    if(!silent) {
      addHistoryAction({
        type: ACTIONS.FRAME_ADDED,
        data: {
          frame: { ...newFrame }
        },
      });
    }
  }

  const duplicateFrame = () => {
    const newFrameIndex = currentFrame.index + 1;
    const newFrame = { ...getEmptyFrame(newFrameIndex), dataUrl: currentFrame.dataUrl }
    addFrame(newFrame);
  }

  const deleteFrame = (frame, silent = false) => {
    if(frames.length === 1) {
      return;
    }
    const index = frame ? frame.index : currentFrame.index;
    if(!silent) {
      addHistoryAction({
        type: ACTIONS.FRAME_REMOVED,
        data: {
          frame: { ...currentFrame }
        },
      });
    }
    const framesBefore = frames.slice(0, index);
    const framesAfter = frames.slice(index + 1).map((frame) => ({...frame, index: frame.index - 1}));
    setFrames(
        framesBefore.concat(framesAfter)
    )
    let newIndex = index - 1;
    if(newIndex < 0 || frames.length === 1) {
      newIndex = 0;
    }

    setCurrentFrame(frames[newIndex]);
  }

  return <div className={classes.frames}>
    {
      frames.map((item, index) => <Frame
          setCurrentFrame={(frame) => setCurrentFrame(frame)}
          currentFrame={currentFrame}
          id={item.id}
          key={item.id}
          dataUrl={item.dataUrl}
          frameIndex = { index }
          item={item}
          multipleLeft={multipleLeft}
          multipleRight={multipleRight}
          setMultipleLeft={setMultipleLeft}
          setMultipleRight={setMultipleRight}
          framesLength={frames.length}
          isPlay={isPlay}
          isMultiple={isMultiple}
      />)
    }
  </div>
});

export default Frames;