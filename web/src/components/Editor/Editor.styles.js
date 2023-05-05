import { createUseStyles } from 'react-jss';
import { HEADER_HEIGHT } from '../Header/Header.styles';

export const FRAME_WIDTH = 100;
export const FRAME_HEIGHT = 50;
export const FRAME_MARGIN = 4;
export const LAYERS_HEIGHT = (FRAME_HEIGHT + 8) * 4;
export const LAYERS_TOOLS_WIDTH = 340;


export const useStyles = createUseStyles(theme => {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: `calc(100% - ${HEADER_HEIGHT}px)`,
      userSelect: 'none',
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
      position: 'absolute',
      backgroundColor: theme.colors.mainBackground,
      zIndex: 1,
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
      backgroundColor: theme.colors.mainBackground,
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
    },
    cursor: {
      border: '1px solid black',
      borderRadius: 1000,
      position: 'fixed',
    }
  }
});