import * as uuid from 'uuid';
import { FRAME_TYPES } from './Editor.constants';

export const getEmptyFrame = (type = FRAME_TYPES.FRAME) => ({
    dataUrl: '',
    id: btoa(uuid.v4()),
    type,
});

export const getEmptyLayer = (frames) => ({
    id: btoa(uuid.v4()),
    frames,
    isVisible: true,
    isSupport: false,
});