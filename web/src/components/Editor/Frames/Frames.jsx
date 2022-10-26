import React, {memo, useState, forwardRef, useImperativeHandle, useEffect} from 'react';
import { useStyles } from './Frames.styles';
import clsx from 'clsx';
import Frame from './Frame';
import {getEmptyFrame} from "../Editor.utils";

const Frames = forwardRef(({ setCurrentFrameData, isPlay, setIsPlay, isMultiple }, ref) => {
  const classes = useStyles();
  const steps = [];
  const [currentFrame, setCurrentFrame] = useState(getEmptyFrame(0));
  const [frames, setFrames]= useState([  currentFrame, ]);
  const [multipleLeft, setMultipleLeft] = useState(0);
  const [multipleRight, setMultipleRight] = useState(0);

  useEffect(() => {
    let before;
    let after;
    console.log(isMultiple);
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
      togglePlay
    }
  });

  const updateFrames = (dataUrl) => {
    steps.push(dataUrl);
    const newFrame = { ...currentFrame, dataUrl }
    setCurrentFrame( newFrame );
    const newFrames = frames.map((frame) => {
      if(frame.id === newFrame.id) {
        return newFrame;
      } else {
        return frame;
      }
    });
    setFrames(newFrames);
    if(steps > 20) {
      steps.shift();
    }
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

  const addFrame = () => {
    const index = currentFrame.index + 1;
    let arr = frames;
    arr.splice(index, 0, getEmptyFrame(index))
    arr = arr.map((item, index) => ({...item, index}));
    setFrames(arr);
    setCurrentFrame(arr[index]);
  }

  const duplicateFrame = () => {
    const index = currentFrame.index;
    const newFrameIndex = currentFrame.index + 1;
    const newFrame = { ...getEmptyFrame(newFrameIndex), dataUrl: currentFrame.dataUrl }
    const framesBefore = frames.slice(0, index + 1);
    const framesAfter = frames.slice(index + 1).map((frame) => ({...frame, index: frame.index + 1}));
    setFrames([...framesBefore, newFrame, ...framesAfter]);
    setCurrentFrame(newFrame);
  }

  const deleteFrame = () => {
    if(frames.length === 1) {
      return;
    }
    const index = currentFrame.index;
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