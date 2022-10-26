import { createUseStyles } from 'react-jss';
import { FRAME_WIDTH, FRAME_HEIGHT, FRAME_MARGIN } from './Frame.constants';

export const useStyles = createUseStyles(theme => {
  return {
    frames: {
      display: 'flex',
      overflow: 'hidden',
      overflowX: 'auto',
      '&::-webkit-scrollbar': {
        height: '8px',
        backgroundColor: theme.colors.scrollbarBackground
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: theme.colors.scrollBarThumbColor
      },
      padding: 2
    },
    frameWrapper: {
      position: 'relative',
      width: FRAME_WIDTH,
      height: FRAME_HEIGHT,
      flexShrink: 0,
      flexGrow: 0,
      margin: `16px ${FRAME_MARGIN}px`,
      boxShadow: `6px 6px 13px ${theme.colors.dropShadowDark}, -6px -6px 13px ${theme.colors.dropShadowLight}`,
      '&:first-child' :{
        marginLeft: 'auto'
      },
      '&:last-child' :{
        marginRight: 'auto'
      }
    },
    frame: {
      overflow: 'hidden',
      borderRadius: '3px',
      cursor: 'pointer',
      transition: 'all 0.2s ease-out',
      backgroundColor: theme.colors.paper,
      width: FRAME_WIDTH,
      height: FRAME_HEIGHT,
      flexShrink: 0,
      flexGrow: 0,
      outline: `4px solid ${theme.colors.mainBackground}`
    },
    selected: {
      transition: 'none',
      outline: `1px solid ${theme.colors.buttonBackground}`,
      boxShadow: `6px 6px 13px ${theme.colors.dropShadowLight}, -6px -6px 13px ${theme.colors.dropShadowDark}`,
    },
    frameImage: {
      width: '100%',
      height: '100%'
    }
  }
});