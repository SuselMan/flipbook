import { createUseStyles } from 'react-jss';
import { HEADER_HEIGHT } from '../Header/Header.styles';

export const FRAME_WIDTH = 100;
export const FRAME_HEIGHT = 50;
export const FRAME_MARGIN = 4;
export const LAYERS_HEIGHT = (FRAME_HEIGHT + 8) * 4;
export const LAYERS_TOOLS_WIDTH = 300;

export const useStyles = createUseStyles(theme => {
  return {
    layersPanel: {
      position: 'absolute',
      bottom: 0,
      height: LAYERS_HEIGHT,
      width: '100%',
      border: `2px solid ${theme.colors.paper}`,
      outline: `2px solid ${theme.colors.dropShadowDark}`
    },
    layerTools: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0 20px',
      //filter: 'brightness(1.02)',
      //background: theme.colors.mainBackground,
    },
    layersTools: {
      display: 'flex',
      flexDirection: 'column',
      width: LAYERS_TOOLS_WIDTH,
      height: '100%',
      borderRight: `1px solid ${theme.colors.dropShadowDark}`,
    },
    layersContainer: {
      position: 'absolute',
      left: LAYERS_TOOLS_WIDTH + 1,
      height: LAYERS_HEIGHT,
      bottom: 0,
      overflow: 'auto',
      width: `calc(100% - ${LAYERS_TOOLS_WIDTH + 1}px)`,
      '&::-webkit-scrollbar': {
        height: '10px',
        backgroundColor: theme.colors.scrollbarBackground
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: theme.colors.scrollBarThumbColor
      },
      display: 'flex',
      flexDirection: 'column'
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: `calc(100% - ${HEADER_HEIGHT}px)`
    },
    paper: {
      backgroundColor: theme.colors.paper,
      boxShadow: '20px 20px 41px #dddfe2, -20px -20px 41px #f9fbfe',
      borderRadius: 3,
    },
    workArea: {
      display: 'flex',
      justifyContent: 'center'
    },
    tools: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'absolute'
    },
    leftTools: {
      left: 0
    },
    rightTools: {
      right: 0
    },
    bottomTools: {
      width: '100%',
      position: 'absolute',
      bottom: LAYERS_HEIGHT,
      display: 'flex',
      justifyContent: 'center',
    },
    colorPicker: {
      borderRadius: '8px!important',
      border: '0!important',
      padding: '0!important',
      opacity: '1!important',
      '& input': {
        display: 'none',
      },
      '& > div': {
        zIndex: 200,
      },
      '&:before': {
        backgroundColor: theme.colors.paper
      },
      '&:after': {
        backgroundColor: theme.colors.paper
      }
    }
  }
});