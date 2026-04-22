import React, {forwardRef} from 'react';
import { useTranslation } from 'react-i18next';
import { useStyles } from './Layer.styles';
import {ReactComponent as ClosedEyeIcon} from '../../../../shared/icons/closed-eye.svg';
import {ReactComponent as EyeIcon} from '../../../../shared/icons/eye.svg';
import {ReactComponent as SupportLayerIcon} from '../../../../shared/icons/supportLayer.svg';
import {ReactComponent as TrashIcon} from '../../../../shared/icons/trash.svg';
import RoundButton from '../../../shared/RoundButton/RoundButton';
import DragIcon from '../../../shared/DragIcon/DragIcon';
import {deleteLayerSelector, layerSelector} from "../../Editor.state";
import { useCommit } from '../../../../hooks/useHistory';

import {
    useRecoilState,
    useSetRecoilState,
} from 'recoil';

const LayerTools = forwardRef((props, ref) => {
    const {id, scrollPosition, setActivatorNodeRef, listeners} = props;
    const [layer, setLayer] = useRecoilState(layerSelector(id));
    const deleteLayer = useSetRecoilState(deleteLayerSelector);
    const commit = useCommit();
    const classes = useStyles();
    const { t } = useTranslation();
    return <div className={classes.layerTools} style={{ marginLeft: `${scrollPosition}px` }}>
        <RoundButton isPressed={!layer.isVisible} type='small' title={t('editor.tools.clear')} onClick={() => {
            setLayer({ isVisible: !layer.isVisible })
        }}>{layer.isVisible ? <EyeIcon/> : <ClosedEyeIcon/>}</RoundButton>
        <RoundButton type='small' title={t('editor.tools.clear')} onClick={async () => {
            await commit();
            deleteLayer(id);
        }}><TrashIcon/></RoundButton>
        <RoundButton type='small' title={t('editor.tools.clear')} onClick={() => {}}><SupportLayerIcon/></RoundButton>
        <DragIcon id={id} setActivatorNodeRef={setActivatorNodeRef} listeners={listeners}/>
    </div>
});

export default LayerTools;