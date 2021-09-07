import { createUseStyles } from 'react-jss';

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
    frame: {
      borderRadius: '3px',
      cursor: 'pointer',
      transition: 'all 0.2s ease-out',
      backgroundColor: theme.colors.paper,
      width: 120.4,
      height: 60,
      margin: '16px 4px',
      flexShrink: 0,
      flexGrow: 0,
      boxShadow: `6px 6px 13px #dddfe2, -6px -6px 13px #f9fbfe`,
      '&:first-child' :{
        marginLeft: 'auto'
      },
      '&:last-child' :{
        marginRight: 'auto'
      },
      outline: `4px solid ${theme.colors.mainBackground}`
    },
    selected: {
      transition: 'none',
      outline: `2px solid ${theme.colors.buttonBackground}`
    }
  }
});