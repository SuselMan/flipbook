import { createUseStyles } from 'react-jss';

export const useStyles = createUseStyles(theme => {
  return {
    brush: {
      position: 'fixed',
      borderRadius: '100%',
      border: '1px solid #FFF',
      mixBlendMode: 'difference',
      backgroundColor: 'transparent',
      zIndex: 999999,
      pointerEvents: 'none',
    }
  }
});