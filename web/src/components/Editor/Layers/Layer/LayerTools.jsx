import React, {memo, useState, forwardRef, useImperativeHandle, useEffect} from 'react';
import { useStyles } from './Layer.styles';
import {ReactComponent as ClosedEyeIcon} from '../../../../shared/icons/closed-eye.svg';
import {ReactComponent as EyeIcon} from '../../../../shared/icons/eye.svg';
import {ReactComponent as SupportLayerIcon} from '../../../../shared/icons/supportLayer.svg';
import {ReactComponent as TrashIcon} from '../../../../shared/icons/trash.svg';
import RoundButton from '../../../shared/RoundButton/RoundButton';
import { stringNames, getString } from '../../../../configs/strings';
import DragIcon from '../../../shared/DragIcon/DragIcon';
import {deleteLayerSelector, layerSelector} from "../../Editor.state";

import {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useSetRecoilState,
    useRecoilValue,
} from 'recoil';

const LayerTools = forwardRef((props, ref) => {
    const {id, index, scrollPosition, setActivatorNodeRef, listeners} = props;
    const [layer, setLayer] = useRecoilState(layerSelector(id));
    const deleteLayer = useSetRecoilState(deleteLayerSelector);
    const classes = useStyles();
    return <div className={classes.layerTools} style={{ marginLeft: `${scrollPosition}px` }}>
        <RoundButton isPressed={!layer.isVisible} type='small' title={getString(stringNames.clearToolTitle)} onClick={() => {
            setLayer({ isVisible: !layer.isVisible })
        }}>{layer.isVisible ? <EyeIcon/> : <ClosedEyeIcon/>}</RoundButton>
        <RoundButton type='small' title={getString(stringNames.clearToolTitle)} onClick={() => {
            deleteLayer(id);
        }}><TrashIcon/></RoundButton>
        <RoundButton type='small' title={getString(stringNames.clearToolTitle)} onClick={() => {}}><SupportLayerIcon/></RoundButton>
        <DragIcon id={id} setActivatorNodeRef={setActivatorNodeRef} listeners={listeners}/>
    </div>
});

export default LayerTools;