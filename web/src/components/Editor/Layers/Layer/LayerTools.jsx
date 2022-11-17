import React, {memo, useState, forwardRef, useImperativeHandle, useEffect} from 'react';
import { useStyles } from './Layer.styles';
import {ReactComponent as EyeIcon} from '../../../../shared/icons/eye.svg';
import {ReactComponent as SupportLayerIcon} from '../../../../shared/icons/supportLayer.svg';
import {ReactComponent as TrashIcon} from '../../../../shared/icons/trash.svg';
import RoundButton from '../../../shared/RoundButton/RoundButton';
import { stringNames, getString } from '../../../../configs/strings';
import DragIcon from '../../../shared/DragIcon/DragIcon';

const LayerFrames = forwardRef((props, ref) => {
    const classes = useStyles();
    return <div className={classes.layerTools}>
        <RoundButton type='small' title={getString(stringNames.clearToolTitle)} onClick={() => {}}><EyeIcon/></RoundButton>
        <RoundButton type='small' title={getString(stringNames.clearToolTitle)} onClick={() => {}}><TrashIcon/></RoundButton>
        <RoundButton type='small' title={getString(stringNames.clearToolTitle)} onClick={() => {}}><SupportLayerIcon/></RoundButton>
        <DragIcon/>
    </div>
});

export default LayerFrames;