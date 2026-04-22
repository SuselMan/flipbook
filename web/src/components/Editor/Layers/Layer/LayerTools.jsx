import React, {forwardRef, memo} from 'react';
import { useTranslation } from 'react-i18next';
import { useStyles } from './Layer.styles';
import {ReactComponent as ClosedEyeIcon} from '../../../../shared/icons/closed-eye.svg';
import {ReactComponent as EyeIcon} from '../../../../shared/icons/eye.svg';
import {ReactComponent as SupportLayerIcon} from '../../../../shared/icons/supportLayer.svg';
import {ReactComponent as TrashIcon} from '../../../../shared/icons/trash.svg';
import RoundButton from '../../../shared/RoundButton/RoundButton';
import DragIcon from '../../../shared/DragIcon/DragIcon';
import { useEditorStore } from '../../../../stores/editorStore';
import { useCommit } from '../../../../hooks/useHistory';

const LayerTools = forwardRef((props, ref) => {
    const {id, scrollPosition, setActivatorNodeRef, listeners} = props;
    const layer = useEditorStore((s) => s.layersMap[id]);
    const updateLayer = useEditorStore((s) => s.updateLayer);
    const deleteLayer = useEditorStore((s) => s.deleteLayer);
    const commit = useCommit();
    const classes = useStyles();
    const { t } = useTranslation();
    if (!layer) return null;
    return <div className={classes.layerTools} style={{ marginLeft: `${scrollPosition}px` }}>
        <RoundButton isPressed={!layer.isVisible} type='small' title={t('editor.tools.clear')} onClick={() => {
            updateLayer(id, { isVisible: !layer.isVisible })
        }}>{layer.isVisible ? <EyeIcon/> : <ClosedEyeIcon/>}</RoundButton>
        <RoundButton type='small' title={t('editor.tools.clear')} onClick={async () => {
            await commit();
            deleteLayer(id);
        }}><TrashIcon/></RoundButton>
        <RoundButton type='small' title={t('editor.tools.clear')} onClick={() => {}}><SupportLayerIcon/></RoundButton>
        <DragIcon id={id} setActivatorNodeRef={setActivatorNodeRef} listeners={listeners}/>
    </div>
});

export default memo(LayerTools);
