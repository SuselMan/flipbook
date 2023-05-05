import { createUseStyles } from 'react-jss';

export const useStyles = createUseStyles(theme => {
  return {
    container: {
      width: 40,
      height: 40,
      margin: 8,
      border: 'none',
      cursor: 'move',
      background: 'transparent',
    },
    line: {
      width: '100%',
      height: 4,
      margin: 1,
      borderRadius: '50px',
      background: `linear-gradient(180deg, ${theme.colors.selectedOutline}, ${theme.colors.paper})`,
      boxShadow:  '20px 20px 60px #d5d5d5, -20px -20px 60px #ebebeb',
      borderBottom: `1px solid ${theme.colors.paper}`
    },
  }
});