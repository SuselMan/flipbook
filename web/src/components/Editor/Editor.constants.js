export const TOOLS = {
    BRUSH: 'brush',
    ERASER: 'eraser',
    MOVE_SCREEN: 'move_screen',
}

export const FRAME_TYPES = {
    FRAME: 'frame',
    POINT: 'empty',
    ADD_FRAME: 'ADD_FRAME'
}

export const ACTIONS = {
    FRAME_CHANGED: 'FRAME_CHANGED',
    FRAME_REMOVED: 'FRAME_REMOVED',
    FRAME_ADDED: 'FRAME_ADDED',
    LAYER_ADDED: 'LAYER_ADDED',
    LAYER_REMOVED: 'LAYER_REMOVED'
}

export const TIMELINE_KEYS = {
    CURRENT_FRAME: 'TIMELINE/RCURRENT_FRAME_INDEX',
    CURRENT_LAYER: 'TIMELINE/CURRENT_LAYER_ID',
    LAYERS: 'TIMELINE/LAYERS',
    LAYERS_MAP: 'TIMELINE/LAYERS_MAP',
    MAX_LENGTH: 'TIMELINE/MAX_LENGTH',
    FRAMES_MAP: 'TIMELINE/FRAMES_MAP',
    HISTORY: 'TIMELINE/HISTORY',
    LAYER: 'TIMELINE/LAYER',
    FRAME_SELECTOR: 'TIMELINE/FRAME_SELECTOR',
    NEXT_FRAME: 'TIMELINE/NEXT_FRAME',
    ADD_LAYER_SELECTOR: 'TIMELINE/ADD_LAYER_SELECTOR',
    LAYER_SELECTOR: 'TIMELINE/LAYER_SELECTOR',
    GET_SLICE: 'TIMELINE/GET_SLICE',
    CURRENT_INDEX: 'TIMELINE/CURRENT_INDEX',
    ADD_FRAME: 'TIMELINE/ADD_FRAME',
    CLEAR_FRAME: 'TIMELINE/CLEAR_FRAME',
    DELETE_FRAME: 'TIMELINE/DELETE_FRAME',
    CREATE_RANGE: 'TIMELINE/CREATE_RANGE',
    RANGE: 'TIMELINE/RANGE',
    DELETE_LAYER: 'TIMELINE/DELETE_LAYER',
};

export const EDITOR_KEYS = {
    IS_PLAY: 'EDITOR/IS_PLAY',
    IS_ONION_SKIN: 'EDITOR/IS_ONION_SKIN',
    ONION_SKIN_LEFT: 'EDITOR/ONION_SKIN_LEFT',
    ONION_SKIN_RIGHT: 'EDITOR/ONION_SKIN_RIGHT',
    SELECTED_TOOL: 'EDITOR/SELECTED_TOOL',
    SELECTED_COLOR: 'EDITOR/SELECTED_COLOR',
    BRUSH_SIZE: 'EDITOR/BRUSH_SIZE',
    OPACITY: 'EDITOR/OPACITY',
    IS_COLOR_PICKING: 'EDITOR/IS_COLOR_PICKING',
    IS_OPACITY_PICKING: 'EDITOR/IS_OPACITY_PICKING',
    IS_BRUSH_SIZE_PICKING: 'EDITOR/IS_BRUSH_SIZE_PICKING',
}