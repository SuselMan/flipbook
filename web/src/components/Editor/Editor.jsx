import React, { useEffect, useState } from 'react';
import { useStyles } from './Editor.styles';
import Konva from 'konva';
import RoundButton from '../shared/RoundButton/RoundButton';
import {ReactComponent as TrashIcon} from '../../shared/icons/trash.svg';
import {ReactComponent as SaveIcon} from '../../shared/icons/save.svg';
import {ReactComponent as ColorIcon} from '../../shared/icons/color.svg';
import {ReactComponent as PenIcon} from '../../shared/icons/pen.svg';
import {ReactComponent as EraserIcon} from '../../shared/icons/eraser.svg';
import Frames from './Frames/Frames';
import * as uuid from 'uuid';

const Editor = () => {
  const classes = useStyles();
  const steps = [];
  const [frames, setFrames]= useState([  btoa(uuid.v4()), ]);
  console.log('btoa(uuid.v4())', btoa(uuid.v4()));

    useEffect(() => {

      const undo = (evt) => {
        if (evt.ctrlKey) {
          if(evt.key === 'z') {
            if(steps.length <= 1) {
              alert('Nothing to undo');
              return;
            }
            steps.pop();
            console.log('undo', steps[steps.length - 1]);
            const img = new Image;
            img.onload = () => {
              context.fillStyle = "#FFF";
              context.fillRect(0, 0, 1024, 600);
              context.drawImage(img,0,0); // Or at whatever offset you like
              layer.batchDraw();
            };
            img.src = steps[steps.length - 1];
          }
        }
      }

      document.addEventListener('keyup', undo);

      console.log('conva', Konva);
      console.log('container', document.querySelector('#container'));
      const stage = new Konva.Stage({
        container: 'drawContainer',
        width: 1024,
        height: 600
      });

      const layer = new Konva.Layer();
      stage.add(layer);

      const canvas = document.createElement('canvas');
      canvas.width = stage.width();
      canvas.height = stage.height();

      const image = new Konva.Image({
        image: canvas,
        x: 0,
        y: 0
      });
      layer.add(image);
      stage.draw();

      const context = canvas.getContext('2d');
      context.strokeStyle = '#000';
      context.lineJoin = 'round';
      context.lineWidth = 10;

      let isPaint = false;
      let lastPointerPosition;
      let mode = 'brush';

      document.body.addEventListener('pointerdown', function(evt) {
        isPaint = true;
        lastPointerPosition = stage.getPointerPosition();
      });

      document.body.addEventListener('pointerup', function() {
        isPaint = false;
        steps.push(image.toDataURL());
        if(steps > 20) {
          steps.shift();
        }
        console.log('steps', steps);
      });

      const draw = (evt) => {
        if (!isPaint) {
          return;
        }

        context.lineWidth = (evt.pressure || 1) * 15;

        if (mode === 'brush') {
          context.globalCompositeOperation = 'source-over';
        }
        if (mode === 'eraser') {
          context.globalCompositeOperation = 'destination-out';
        }
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
    })
  return <div className={classes.container}>
    <div className={classes.workArea}>
      <div className={classes.tools}>
        <RoundButton onClick={() => {setFrames(frames.concat([btoa(uuid.v4())]))}}>+</RoundButton>
        <RoundButton><TrashIcon/></RoundButton>
        <RoundButton><SaveIcon/></RoundButton>
      </div>
      <div id="drawContainer" className={classes.paper}></div>
      <div className={classes.tools}>
        <RoundButton><PenIcon/></RoundButton>
        <RoundButton><EraserIcon/></RoundButton>
        <RoundButton><ColorIcon/></RoundButton>
      </div>
    </div>
    <Frames frames={frames}/>
  </div>
};

export default Editor;