export const getString = (stringName) => {
    const locale = navigator.language;
    let localeName = locale.split('-')?.[0] || locale;
    localeName = localeName.toUpperCase();
    if(!STRINGS[localeName]) {
        localeName = 'EN'
    }
    return STRINGS[localeName][stringName];
}

export const stringNames = {
    saveToolTitle: 'saveToolTitle',
    brushToolTitle: 'brushToolTitle',
    eraserToolTitle: 'eraserToolTitle',
    paletteToolTitle: 'paletteToolTitle',
    addFrameToolTitle: 'addFrameToolTitle',
    onionSkinToolTitle: 'onionSkinToolTitle',
    playPauseToolTitle: 'playPauseToolTitle',
    duplicateFrameToolTitle: 'duplicateFrameToolTitle',
    deleteFrameToolTitle: 'deleteFrameToolTitle',
    clearToolTitle: 'clearToolTitle',
    brushSizeToolTitle: 'brushSizeToolTitle',
    opacityToolTitle: 'opacityToolTitle',
    undoToolTitle: 'undoToolTitle',
    redoToolTitle: 'redoToolTitle',
}

export const STRINGS = {
    EN: {
        saveToolTitle: 'Save (Ctrl S)',
        brushToolTitle: 'Brush (B)',
        eraserToolTitle: 'Eraser (E)',
        paletteToolTitle: 'Palette',
        addFrameToolTitle: 'Add frame (Ctrl F)',
        onionSkinToolTitle: 'Onion skin (Ctrl O)',
        playPauseToolTitle: 'Play/Pause (Space)',
        duplicateFrameToolTitle: 'Duplicate frame (Ctrl D)',
        deleteFrameToolTitle: 'Delete frame (Delete)',
        clearToolTitle: 'Clear frame (Ctrl Backspace)',
        brushSizeToolTitle: 'Brush size',
        opacityToolTitle: 'Opacity',
        undoToolTitle: 'Undo (Ctrl Z)',
        redoToolTitle: 'Redo (Ctrl Shift Z)',
    }
}