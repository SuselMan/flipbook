import React, { useEffect, useState, useRef } from 'react';
import { useStyles } from './Editor.styles';
import clsx from 'clsx';
import RoundButton from '../shared/RoundButton/RoundButton';
import { ReactComponent as TrashIcon } from '../../shared/icons/trash.svg';
import { ReactComponent as SaveIcon } from '../../shared/icons/save.svg';
import { ReactComponent as PenIcon } from '../../shared/icons/pen.svg';
import { ReactComponent as EraserIcon } from '../../shared/icons/eraser.svg';
import { ReactComponent as PlayIcon } from '../../shared/icons/play.svg';
import { ReactComponent as PauseIcon } from '../../shared/icons/pause.svg';
import { ReactComponent as DuplicateIcon } from '../../shared/icons/duplicate.svg';
import { ReactComponent as MultipleIcon } from '../../shared/icons/multiple.svg';
import { ReactComponent as ClearIcon } from '../../shared/icons/clear.svg';
import { ReactComponent as UndoIcon } from '../../shared/icons/undo.svg';
import { ReactComponent as RedoIcon } from '../../shared/icons/redo.svg';
import { ReactComponent as AddLayerIcon } from '../../shared/icons/add-layer.svg';
import { ReactComponent as MoveIcon } from '../../shared/icons/move-icon.svg';
import { ReactComponent as ZoomInIcon } from '../../shared/icons/zoomin-icon.svg';
import { ReactComponent as ZoomOutIcon } from '../../shared/icons/zoomout-icon.svg';
import { ReactComponent as PreloaderIcon } from "../../shared/icons/preloader.svg";
import BrushCursor from '../shared/BrushCursor/BrushCursor';
import BaseButton from "../shared/BaseButton/BaseButton";
import Modal from '../shared/Modal/Modal.jsx';
import TextField from '@mui/material/TextField';
import { ensureDraft, getDraft, setCurrentDraftId, saveDraft } from '../../modules/db/drafts';
import { useDraftAutosave } from '../../hooks/useDraftAutosave';
import { useHydrateEditor } from '../../hooks/useHydrateEditor';
import { useCommit, useUndo, useRedo, useResetHistory, useHistoryState } from '../../hooks/useHistory';
import Shortcuts from '../../modules/Shortcuts/Shortcuts';
import { SHORTCUTS } from '../../configs/shortcuts';

import { stringNames, getString } from '../../configs/strings';
import Layers from './Layers/Layers';
import Canvas from "./Canvas/Canvas";
import Color from './Tools/Color/Color';
import BrushSize from './Tools/BrushSize/BrushSize';
import Opacity from './Tools/Opacity/Opacity';
import useStateRef from 'react-usestateref';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { TOOLS, FINGER_OFFSET_Y, FINGER_OFFSET_X } from './Editor.constants';
import { renderPreview, packSource, STAGES } from '../../modules/render/render';
import { publishProject } from '../../modules/API/API';
import {
  currentLayerAtom,
  isPlayAtom,
  isOnionSkinAtom,
  selectedToolAtom,
  selectedColorAtom,
  brushSizeAtom,
  opacityAtom,
  isColorPickingAtom,
  isOpacityPickingAtom,
  isBrushSizePickingAtom,
  currentFrameAtom,
  frameSelector,
  addLayerSelector,
  getSliceSelector,
  nextFrameSelector,
  currentIndexAtom,
  clearFrameSelector,
  deleteFrameSelector,
  addFrameSelector,
  layersAtom,
  layersMap,
  framesMap,
  prevFrameSelector,
  duplicateFrameSelector,
} from './Editor.state';
import { useParams } from "react-router-dom";

const Editor = () => {
  const classes = useStyles();
  const canvasRef = useRef();
  const [isPlay, setIsPlay] = useRecoilState(isPlayAtom);
  const [currentFrame, setCurrentFrame] = useRecoilState(currentFrameAtom);
  const [currentIndex] = useRecoilState(currentIndexAtom);
  const [slice] = useRecoilState(getSliceSelector);
  const [currentLayer, setCurrentLayer] = useRecoilState(currentLayerAtom);
  const [isMultiple, setIsMultiple] = useRecoilState(isOnionSkinAtom);
  const [tool, setTool] = useRecoilState(selectedToolAtom);
  const [currentColor, setCurrentColor] = useRecoilState(selectedColorAtom);
  const [isTooltipOpen, setIsTooltipOpen] = useRecoilState(isColorPickingAtom);
  const setFrame = useSetRecoilState(frameSelector(currentFrame));
  const addLayer = useSetRecoilState(addLayerSelector);
  const nextFrame = useSetRecoilState(nextFrameSelector);
  const [isBrushTooltipOpen, setIsBrushTooltipOpen] = useRecoilState(isBrushSizePickingAtom);
  const [isOpacityTooltipOpen, setIsOpacityTooltipOpen] = useRecoilState(isOpacityPickingAtom);
  const [brushSize, setBrushSize] = useRecoilState(brushSizeAtom);
  const [opacity, setOpacity] = useRecoilState(opacityAtom);
  const clearFrame = useSetRecoilState(clearFrameSelector);
  const deleteFrame = useSetRecoilState(deleteFrameSelector);
  const addFrame = useSetRecoilState(addFrameSelector)
  const prevFrame = useSetRecoilState(prevFrameSelector);
  const duplicateFrame = useSetRecoilState(duplicateFrameSelector);
  const [layers] = useRecoilState(layersAtom);
  const [layersM] = useRecoilState(layersMap);
  const [framesM] = useRecoilState(framesMap);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isBrushVisible, setIsBrushVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isProjectSaving, setIsProjectSaving] = useState(false);
  const [publishError, setPublishError] = useState(null);
  const [publishStage, setPublishStage] = useState(null);
  const [publishProgress, setPublishProgress] = useState(0);
  const [draftId, setDraftId] = useState(null);
  const [forkedFrom, setForkedFrom] = useState(null);

  const params = useParams();
  const hydrateEditor = useHydrateEditor();
  useDraftAutosave(draftId);
  const commit = useCommit();
  const undo = useUndo();
  const redo = useRedo();
  const resetHistory = useResetHistory();
  const { canUndo, canRedo } = useHistoryState();


  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.setMode(tool);
  }, [tool]);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (currentFrame) {
      canvasRef.current.drawScene(slice);
      canvasRef.current.setCurrentLayer(currentLayer);
    } else {
      canvasRef.current.clearScene(true);
    }
  }, [currentFrame, currentIndex, layers, layersM, framesM]);

  useEffect(() => {
    if (isPlay) {
      const timeout = setTimeout(() => {
        nextFrame();
        clearTimeout(timeout);
      }, 100);
    }
  }, [isPlay, currentIndex]);


  useEffect(() => {
    const canvasContainer = canvasRef.current?.elementRef?.();
    if (canvasContainer) {
      canvasContainer.addEventListener('pointermove', (e) => {
        if (!isBrushVisible) {
          setIsBrushVisible(true);
        }
        const { clientX, clientY } = e;
        setCursorPosition({ x: clientX + FINGER_OFFSET_X, y: clientY - FINGER_OFFSET_Y });
      });
      canvasContainer.addEventListener('pointerleave', () => {
        setIsBrushVisible(false);
      });
    }

    let cancelled = false;
    (async () => {
      let draft;
      if (params.draftId) {
        draft = await getDraft(params.draftId);
        if (draft) setCurrentDraftId(draft.id);
      }
      if (!draft) {
        draft = await ensureDraft();
      }
      if (cancelled) return;
      if (draft.state) hydrateEditor(draft.state);
      resetHistory();
      if (draft.name) setName(draft.name);
      if (draft.description) setDescription(draft.description);
      if (draft.forkedFrom) setForkedFrom(draft.forkedFrom);
      setDraftId(draft.id);
      setIsLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const onCanvasUpdated = async (json, dataUrl) => {
    await commit();
    setFrame({ dataUrl, json });
  }

  const zoomIn = () => {
    canvasRef.current?.zoomIn();
  }

  const zoomOut = () => {
    canvasRef.current?.zoomOut();
  }

  const zoomReset = () => {
    canvasRef.current?.zoomReset();
  }

  const showSaveModal = () => {
    const previewData = canvasRef.current?.getPreview?.();
    setPreview(previewData);
    setIsModalOpen(true);
  };

  const saveProject = async () => {
    setPublishError(null);
    setIsProjectSaving(true);
    try {
      const state = { layers, layersMap: layersM, framesMap: framesM };
      const projectName = name || 'Untitled project';

      setPublishStage(STAGES.COMPOSITING);
      setPublishProgress(0);
      const { previewBlob, thumbnailBlob, frameCount, width, height } =
        await renderPreview(state, { width: 1024, height: 600, fps: 10 }, (stage, p) => {
          setPublishStage(stage);
          setPublishProgress(p);
        });

      setPublishStage(STAGES.PACKING);
      setPublishProgress(0);
      const sourceBlob = await packSource(
        state,
        { name: projectName, description, fps: 10, canvasWidth: width, canvasHeight: height, frameCount },
        (stage, p) => setPublishProgress(p),
      );

      setPublishStage('uploading');
      setPublishProgress(0);
      const response = await publishProject({
        sourceBlob,
        previewBlob,
        thumbnailBlob,
        meta: {
          name: projectName,
          description,
          fps: 10,
          canvasWidth: width,
          canvasHeight: height,
          frameCount,
          durationMs: Math.round((frameCount / 10) * 1000),
          forkedFrom: forkedFrom || undefined,
        },
        onProgress: setPublishProgress,
      });

      if (draftId) {
        await saveDraft(draftId, {
          name: projectName,
          description,
          publishedAs: response?.project?.id || null,
        });
      }

      setIsProjectSaving(false);
      setPublishStage(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Publish failed', err);
      setPublishError(err.message || String(err));
      setIsProjectSaving(false);
      setPublishStage(null);
    }
  };

  const togglePlay = () => {
    setIsPlay(!isPlay);
  };

  const pickColor = (color) => {
    setCurrentColor(color.hex);
    canvasRef.current?.setColor(color.hex);
    setIsTooltipOpen(false);
  }

  const setBrush = (size) => {
    setBrushSize(size);
    canvasRef.current?.setBrush(size);
  }
  const setOpacityValue = (value) => {
    setOpacity(value);
    canvasRef.current?.setOpacity(value);
  }

  const onClearFrame = () => {
    // clearScene triggers onCanvasUpdated → commit happens there
    canvasRef.current?.clearScene();
  };

  const handleAddFrame = async () => {
    await commit();
    addFrame();
  };

  const handleAddLayer = async () => {
    await commit();
    addLayer();
  };

  const handleDeleteFrame = async () => {
    await commit();
    deleteFrame();
  };

  const handleDuplicateFrame = async () => {
    await commit();
    duplicateFrame();
  };

  useEffect(() => {
    if (!Shortcuts) return;
    const bindings = {
      [SHORTCUTS.UNDO]: () => undo(),
      [SHORTCUTS.REDO]: () => redo(),
      [SHORTCUTS.SAVE]: () => showSaveModal(),
      [SHORTCUTS.CLEAR_FRAME]: onClearFrame,
      [SHORTCUTS.ADD_FRAME]: handleAddFrame,
      [SHORTCUTS.ADD_LAYER]: handleAddLayer,
      [SHORTCUTS.DELETE_FRAME]: handleDeleteFrame,
      [SHORTCUTS.DUPLICATE_FRAME]: handleDuplicateFrame,
      [SHORTCUTS.PLAY_PAUSE]: () => setIsPlay((p) => !p),
      [SHORTCUTS.ONION_SKIN_TOOL]: () => setIsMultiple((m) => !m),
      [SHORTCUTS.BRUSH_TOOL]: () => setTool(TOOLS.BRUSH),
      [SHORTCUTS.ERASER_TOOL]: () => setTool(TOOLS.ERASER),
      [SHORTCUTS.NEXT_FRAME]: () => nextFrame(),
      [SHORTCUTS.PREVIOUS_FRAME]: () => prevFrame(),
      [SHORTCUTS.REDUCE_BRUSH]: () => setBrush(Math.max(1, brushSize - 1)),
      [SHORTCUTS.INCREASE_BRUSH]: () => setBrush(Math.min(100, brushSize + 1)),
      [SHORTCUTS.ZOOM_IN]: () => zoomIn(),
      [SHORTCUTS.ZOOM_OUT]: () => zoomOut(),
      [SHORTCUTS.ZOOM_RESET]: () => zoomReset(),
    };
    for (const [action, handler] of Object.entries(bindings)) {
      Shortcuts.on(action, handler);
    }
    return () => {
      for (const action of Object.keys(bindings)) Shortcuts.off(action);
    };
  }, [undo, redo, brushSize]);

  return <div className={classes.container}>
    <Modal isOpen={isModalOpen} close={() => {
      if (!isProjectSaving) setIsModalOpen(false);
    }} title="Publish Project">
      {!isProjectSaving && <div className={classes.saveContainer}>
        <img src={preview} alt="preview" className={classes.preview}/>
        <div className={classes.saveForm}>
          <TextField
            id="Name"
            label="Project Name*"
            variant="standard"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            id="Description"
            label="Description"
            variant="standard"
            multiline
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {publishError && <div style={{ color: '#ff5656' }}>{publishError}</div>}
          <BaseButton size="small" onClick={() => saveProject()}>
            Publish
          </BaseButton>
        </div>
      </div>}
      {isProjectSaving && (
        <div className={classes.saveContainer}>
          <PreloaderIcon className={classes.preloader}/>
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <div>{
              publishStage === STAGES.COMPOSITING ? 'Compositing frames' :
              publishStage === STAGES.ENCODING ? 'Encoding WebP' :
              publishStage === STAGES.PACKING ? 'Packing source' :
              publishStage === 'uploading' ? 'Uploading' :
              'Working'
            }…</div>
            <div style={{ opacity: 0.7, fontSize: 12, marginTop: 4 }}>
              {Math.round((publishProgress || 0) * 100)}%
            </div>
          </div>
        </div>
      )}
    </Modal>
    {isLoading && <PreloaderIcon className={classes.preloader}/>}
    {!isLoading && <>
      <div className={classes.workArea}>
        <div className={clsx(classes.tools, classes.leftTools)}>
          <RoundButton onClick={() => showSaveModal()}
                       title={getString(stringNames.saveToolTitle)}><SaveIcon/></RoundButton>
          <RoundButton onClick={() => undo()} disabled={!canUndo}
                       title={getString(stringNames.undoToolTitle)}><UndoIcon/></RoundButton>
          <RoundButton onClick={() => redo()} disabled={!canRedo}
                       title={getString(stringNames.redoToolTitle)}><RedoIcon/></RoundButton>
          <RoundButton onClick={() => setTool(TOOLS.MOVE_SCREEN)} isPressed={tool === TOOLS.MOVE_SCREEN}
                       title={getString(stringNames.redoToolTitle)}><MoveIcon/></RoundButton>
          <RoundButton onClick={zoomIn}
                       title={getString(stringNames.redoToolTitle)}><ZoomInIcon/></RoundButton>
          <RoundButton onClick={zoomOut}
                       title={getString(stringNames.redoToolTitle)}><ZoomOutIcon/></RoundButton>
        </div>
        <BrushCursor x={cursorPosition.x} y={cursorPosition.y} size={brushSize} isVisible={isBrushVisible}/>
        <Canvas
          onCanvasUpdated={(json, data) => onCanvasUpdated(json, data)}
          tool={tool}
          ref={canvasRef}
        />
        <div className={clsx(classes.tools, classes.rightTools)}>
          <RoundButton
            title={getString(stringNames.brushToolTitle)}
            onClick={() => setTool(TOOLS.BRUSH)}
            isPressed={tool === TOOLS.BRUSH}
          >
            <PenIcon/>
          </RoundButton>
          <RoundButton
            title={getString(stringNames.eraserToolTitle)}
            onClick={() => setTool(TOOLS.ERASER)}
            isPressed={tool === TOOLS.ERASER}
          >
            <EraserIcon/>
          </RoundButton>
          <Color
            isTooltipOpen={isTooltipOpen}
            setIsTooltipOpen={setIsTooltipOpen}
            currentColor={currentColor}
            pickColor={pickColor}
          />
          <BrushSize
            brushSize={brushSize}
            setIsBrushTooltipOpen={setIsBrushTooltipOpen}
            currentColor={currentColor}
            isBrushTooltipOpen={isBrushTooltipOpen}
            setBrush={setBrush}
          />
          <Opacity
            currentColor={currentColor}
            opacity={opacity}
            setOpacityValue={setOpacityValue}
            isOpacityTooltipOpen={isOpacityTooltipOpen}
            setIsOpacityTooltipOpen={setIsOpacityTooltipOpen}
          />
        </div>
      </div>
      <div className={classes.bottomTools}>
        <RoundButton title={getString(stringNames.addFrameToolTitle)} onClick={handleAddFrame}>+</RoundButton>
        <RoundButton title={getString(stringNames.addFrameToolTitle)} onClick={handleAddLayer}><AddLayerIcon/></RoundButton>
        <RoundButton title={getString(stringNames.duplicateFrameToolTitle)} onClick={handleDuplicateFrame}>
          <DuplicateIcon/>
        </RoundButton>
        <RoundButton title={getString(stringNames.playPauseToolTitle)} onClick={togglePlay}>
          {isPlay ? <PauseIcon/> : <PlayIcon/>}
        </RoundButton>
        <RoundButton title={getString(stringNames.deleteFrameToolTitle)} onClick={handleDeleteFrame}><TrashIcon/></RoundButton>
        <RoundButton title={getString(stringNames.onionSkinToolTitle)} isPressed={isMultiple} onClick={() => setIsMultiple(!isMultiple)}>
          <MultipleIcon/>
        </RoundButton>
        <RoundButton title={getString(stringNames.clearToolTitle)} onClick={onClearFrame}><ClearIcon/></RoundButton>
      </div>
      <Layers/>
    </>}
  </div>
};

export default Editor;