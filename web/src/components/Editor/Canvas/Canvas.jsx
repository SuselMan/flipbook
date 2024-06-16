import React, { memo, useState } from 'react';
import { useStyles } from './Frames.styles';
import clsx from 'clsx';

import { Stage, Layer, Rect, Circle, Image as KonvaImage } from 'react-konva';

const Canvas = ({ data }) => {
  return <Stage className={classes.paper} width={STAGE_WIDTH} height={STAGE_HEIGHT} ref={stageRef}>
    {framesData.map((frame, index) => {
      return <Layer ref={layerRef} key={index}>
        <KonvaImage
          image={canvas}
          ref={imageRef}
        />
      </Layer>
    })}
  </Stage>
}

export default memo(Frames);