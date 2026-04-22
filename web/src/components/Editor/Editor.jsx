import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useStyles } from './Editor.styles';
import clsx from 'clsx';
import RoundButton from '../shared/RoundButton/RoundButton';
import { ReactComponent as TrashIcon } from '../../shared/icons/trash.svg';
import { ReactComponent as SaveIcon } from '../../shared/icons/save.svg';
import { ReactComponent as PenIcon } from '../../shared/icons/pen.svg';
import { ReactComponent as EraserIcon } from '../../shared/icons/eraser.svg';
import { ReactComponent as FillIcon } from '../../shared/icons/fill.svg';
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
import { useTooltip } from '../../hooks/useShortcutTooltip';
import { playTick, drawSceneMark, resetPlayMetrics } from '../../modules/metrics/playMetric';

import Layers from './Layers/Layers';
import Canvas from "./Canvas/Canvas";
import Color from './Tools/Color/Color';
import BrushSize from './Tools/BrushSize/BrushSize';
import Opacity from './Tools/Opacity/Opacity';
import { useEditorStore, selectSlice, shallow } from '../../stores/editorStore';
import { TOOLS, FINGER_OFFSET_Y, FINGER_OFFSET_X } from './Editor.constants';
import { renderPreview, packSource, STAGES } from '../../modules/render/render';
import { publishProject } from '../../modules/API/API';
import { useParams } from "react-router-dom";

const Editor = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const canvasRef = useRef();
  const isPlay = useEditorStore((s) => s.isPlay);
  const setIsPlay = useEditorStore((s) => s.setIsPlay);
  const currentFrame = useEditorStore((s) => s.currentFrame);
  const currentIndex = useEditorStore((s) => s.currentIndex);
  const slice = useEditorStore(selectSlice, shallow);
  const currentLayer = useEditorStore((s) => s.currentLayer);
  const isMultiple = useEditorStore((s) => s.isOnionSkin);
  const setIsMultiple = useEditorStore((s) => s.setIsOnionSkin);
  const multipleLeft = useEditorStore((s) => s.onionSkinLeft);
  const multipleRight = useEditorStore((s) => s.onionSkinRight);
  const tool = useEditorStore((s) => s.selectedTool);
  const setTool = useEditorStore((s) => s.setSelectedTool);
  const currentColor = useEditorStore((s) => s.selectedColor);
  const setCurrentColor = useEditorStore((s) => s.setSelectedColor);
  const isTooltipOpen = useEditorStore((s) => s.isColorPicking);
  const setIsTooltipOpen = useEditorStore((s) => s.setIsColorPicking);
  const setFrame = useEditorStore((s) => s.updateFrame);
  const addLayer = useEditorStore((s) => s.addLayer);
  const nextFrame = useEditorStore((s) => s.nextFrame);
  const isBrushTooltipOpen = useEditorStore((s) => s.isBrushSizePicking);
  const setIsBrushTooltipOpen = useEditorStore((s) => s.setIsBrushSizePicking);
  const isOpacityTooltipOpen = useEditorStore((s) => s.isOpacityPicking);
  const setIsOpacityTooltipOpen = useEditorStore((s) => s.setIsOpacityPicking);
  const brushSize = useEditorStore((s) => s.brushSize);
  const setBrushSize = useEditorStore((s) => s.setBrushSize);
  const opacity = useEditorStore((s) => s.opacity);
  const setOpacity = useEditorStore((s) => s.setOpacity);
  const deleteFrame = useEditorStore((s) => s.deleteFrame);
  const addFrame = useEditorStore((s) => s.addFrame);
  const prevFrame = useEditorStore((s) => s.prevFrame);
  const duplicateFrame = useEditorStore((s) => s.duplicateFrame);
  const layers = useEditorStore((s) => s.layers);
  const layersM = useEditorStore((s) => s.layersMap);
  const framesM = useEditorStore((s) => s.framesMap);
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
  const tooltip = useTooltip();


  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.setMode(tool);
  }, [tool]);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!currentFrame) {
      canvasRef.current.clearScene(true);
      return;
    }
    // Collect onion skin neighbours: previous N frames (before) and next M frames (after)
    // for the CURRENT layer. `before[0]` is the immediately previous frame etc.
    let before = [];
    let after = [];
    if (isMultiple && !isPlay) {
      const layer = layersM[currentLayer];
      if (layer?.frames) {
        // multipleLeft is stored as a negative offset (e.g. -2 = two frames back)
        const leftCount = Math.max(0, -multipleLeft);
        const rightCount = Math.max(0, multipleRight);
        for (let k = 1; k <= leftCount; k++) {
          const idx = currentIndex - k;
          if (idx < 0) break;
          const fid = layer.frames[idx];
          const f = fid ? framesM[fid] : null;
          if (f?.dataUrl) before.push(f.dataUrl);
        }
        for (let k = 1; k <= rightCount; k++) {
          const idx = currentIndex + k;
          const fid = layer.frames[idx];
          const f = fid ? framesM[fid] : null;
          if (f?.dataUrl) after.push(f.dataUrl);
        }
      }
    }
    const drawStart = isPlay ? performance.now() : 0;
    canvasRef.current.drawScene(slice, before, after);
    canvasRef.current.setCurrentLayer(currentLayer);
    if (isPlay) drawSceneMark(performance.now() - drawStart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFrame, currentIndex, layers, layersM, framesM, isMultiple, multipleLeft, multipleRight, isPlay]);

  useEffect(() => {
    if (!isPlay) {
      resetPlayMetrics();
      return;
    }
    const FRAME_MS = 100;
    let rafId;
    let lastTs = performance.now();
    const tick = (now) => {
      if (now - lastTs >= FRAME_MS) {
        lastTs = now;
        playTick();
        nextFrame();
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlay]);


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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const projectName = name || t('feed.untitled');

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
      [SHORTCUTS.FILL_TOOL]: () => setTool(TOOLS.FILL),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undo, redo, brushSize]);

  return <div className={classes.container}>
    <Modal isOpen={isModalOpen} close={() => {
      if (!isProjectSaving) setIsModalOpen(false);
    }} title={t('editor.publishTitle')}>
      {!isProjectSaving && <div className={classes.saveContainer}>
        <img src={preview} alt="preview" className={classes.preview}/>
        <div className={classes.saveForm}>
          <TextField
            id="Name"
            label={t('editor.projectName')}
            variant="standard"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            id="Description"
            label={t('editor.description')}
            variant="standard"
            multiline
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {publishError && <div style={{ color: '#ff5656' }}>{publishError}</div>}
          <BaseButton size="small" onClick={() => saveProject()}>
            {t('editor.publish')}
          </BaseButton>
        </div>
      </div>}
      {isProjectSaving && (
        <div className={classes.saveContainer}>
          <PreloaderIcon className={classes.preloader}/>
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <div>{
              publishStage === STAGES.COMPOSITING ? t('editor.stages.compositing') :
              publishStage === STAGES.ENCODING ? t('editor.stages.encoding') :
              publishStage === STAGES.PACKING ? t('editor.stages.packing') :
              publishStage === 'uploading' ? t('editor.stages.uploading') :
              t('editor.stages.working')
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
                       title={tooltip(t('editor.tools.publish'), SHORTCUTS.SAVE)}><SaveIcon/></RoundButton>
          <RoundButton onClick={() => undo()} disabled={!canUndo}
                       title={tooltip(t('editor.tools.undo'), SHORTCUTS.UNDO)}><UndoIcon/></RoundButton>
          <RoundButton onClick={() => redo()} disabled={!canRedo}
                       title={tooltip(t('editor.tools.redo'), SHORTCUTS.REDO)}><RedoIcon/></RoundButton>
          <RoundButton onClick={() => setTool(TOOLS.MOVE_SCREEN)} isPressed={tool === TOOLS.MOVE_SCREEN}
                       title={t('editor.tools.moveCanvas')}><MoveIcon/></RoundButton>
          <RoundButton onClick={zoomIn}
                       title={tooltip(t('editor.tools.zoomIn'), SHORTCUTS.ZOOM_IN)}><ZoomInIcon/></RoundButton>
          <RoundButton onClick={zoomOut}
                       title={tooltip(t('editor.tools.zoomOut'), SHORTCUTS.ZOOM_OUT)}><ZoomOutIcon/></RoundButton>
        </div>
        <BrushCursor x={cursorPosition.x} y={cursorPosition.y} size={brushSize} isVisible={isBrushVisible}/>
        <Canvas
          onCanvasUpdated={(json, data) => onCanvasUpdated(json, data)}
          tool={tool}
          ref={canvasRef}
        />
        <div className={clsx(classes.tools, classes.rightTools)}>
          <RoundButton
            title={tooltip(t('editor.tools.brush'), SHORTCUTS.BRUSH_TOOL)}
            onClick={() => setTool(TOOLS.BRUSH)}
            isPressed={tool === TOOLS.BRUSH}
          >
            <PenIcon/>
          </RoundButton>
          <RoundButton
            title={tooltip(t('editor.tools.eraser'), SHORTCUTS.ERASER_TOOL)}
            onClick={() => setTool(TOOLS.ERASER)}
            isPressed={tool === TOOLS.ERASER}
          >
            <EraserIcon/>
          </RoundButton>
          <RoundButton
            title={tooltip(t('editor.tools.fill'), SHORTCUTS.FILL_TOOL)}
            onClick={() => setTool(TOOLS.FILL)}
            isPressed={tool === TOOLS.FILL}
          >
            <FillIcon/>
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
        <RoundButton title={tooltip(t('editor.tools.addFrame'), SHORTCUTS.ADD_FRAME)} onClick={handleAddFrame}>+</RoundButton>
        <RoundButton title={tooltip(t('editor.tools.addLayer'), SHORTCUTS.ADD_LAYER)} onClick={handleAddLayer}><AddLayerIcon/></RoundButton>
        <RoundButton title={tooltip(t('editor.tools.duplicateFrame'), SHORTCUTS.DUPLICATE_FRAME)} onClick={handleDuplicateFrame}>
          <DuplicateIcon/>
        </RoundButton>
        <RoundButton title={tooltip(t('editor.tools.playPause'), SHORTCUTS.PLAY_PAUSE)} onClick={togglePlay}>
          {isPlay ? <PauseIcon/> : <PlayIcon/>}
        </RoundButton>
        <RoundButton title={tooltip(t('editor.tools.deleteFrame'), SHORTCUTS.DELETE_FRAME)} onClick={handleDeleteFrame}><TrashIcon/></RoundButton>
        <RoundButton title={tooltip(t('editor.tools.onionSkin'), SHORTCUTS.ONION_SKIN_TOOL)} isPressed={isMultiple} onClick={() => setIsMultiple(!isMultiple)}>
          <MultipleIcon/>
        </RoundButton>
        <RoundButton title={tooltip(t('editor.tools.clear'), SHORTCUTS.CLEAR_FRAME)} onClick={onClearFrame}><ClearIcon/></RoundButton>
      </div>
      <Layers/>
    </>}
  </div>
};

export default Editor;