import { createUseStyles } from 'react-jss';
import { FRAME_WIDTH, FRAME_HEIGHT, FRAME_MARGIN } from '../../../Editor.styles';

export const useStyles = createUseStyles(theme => {
  return {
    frameWrapper: {
      position: 'relative',
      width: FRAME_WIDTH,
      height: FRAME_HEIGHT,
      flexShrink: 0,
      flexGrow: 0,
      margin: `8px ${FRAME_MARGIN}px`,
      boxShadow: `6px 6px 13px ${theme.colors.dropShadowDark}, -6px -6px 13px ${theme.colors.dropShadowLight}`,
    },
    pointFrame: {
      position: 'relative',
      width: FRAME_WIDTH,
      height: FRAME_HEIGHT,
      flexShrink: 0,
      flexGrow: 0,
      margin: `8px ${FRAME_MARGIN}px`,
      cursor: 'pointer',
      borderRadius: '3px',
      display: 'flex',
      justifyContent: 'center',
      outline: `1px solid ${theme.colors.dropShadowDark}`,
      fontSize: '40px',
      fontWeight: 100,
      lineHeight: '40px',
      textAlign: 'center',
      '& span': {
        display: 'none',
        userSelect: 'none',
      },
      '&:hover': {
        outline: `1px dashed ${theme.colors.mainText}`,
        '& span': {
          display: 'block',
        },
        '& div': {
          display: 'none',
        }
      },
      '&:active': {
        outline: `1px dashed ${theme.colors.buttonBackground}`,
        '& span': {
          display: 'block',
          color: theme.colors.buttonBackground,
        },
        '& div': {
          display: 'none',
        }
      }
    },
    point: {
      borderRadius: '100%',
      backgroundColor: theme.colors.dropShadowDark,
      marginTop: 'auto',
      marginBottom: 'auto',
      width: 20,
      height: 20,
    },
    addFrame: {
      position: 'relative',
      width: FRAME_WIDTH,
      height: FRAME_HEIGHT,
      flexShrink: 0,
      flexGrow: 0,
      margin: `8px ${FRAME_MARGIN}px`,
      border: `1px dashed ${theme.colors.mainText}`,
      cursor: 'pointer',
      fontSize: '40px',
      fontWeight: 100,
      lineHeight: '40px',
      textAlign: 'center',
      outline: `1px dashed ${theme.colors.mainBackground}`,
      borderRadius: '3px',
      '&:hover': {
        borderColor: theme.colors.buttonBackground,
        color: theme.colors.buttonBackground
      },
      '&:active': {
        borderColor: theme.colors.hoverButtonBackground,
        color: theme.colors.hoverButtonBackground,
        borderStyle: 'solid'
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