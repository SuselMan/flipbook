import { createUseStyles } from 'react-jss';

export const useStyles = createUseStyles(theme => {
  return {
    button: {
      margin: 32,
      cursor: 'pointer',
      backgroundColor: theme.colors.mainBackground,
      width: '48px',
      height: '48px',
      borderRadius: '24px',
      color: theme.colors.mainText,
      fontSize: '1.5em',
      //TODO: use all colores from theme here
      boxShadow:  '13px 13px 26px #dddfe2, -13px -13px 26px #f9fbfe',
      border: 'none',

      '&:hover': {
        fontSize: '1.5em',
        transform: 'rotate(360deg)',
      },
      '&:active': {
        outline: 'none',
        fontSize: '1.5em',
        transition: 'none',
      },
      '&:focus': {
        outline: 'none'
      },
      '&>*': {
        width: 20,
        height: 20,
        fill: theme.colors.mainText,
        stroke: theme.colors.mainText,
        color: theme.colors.mainText,
      }
    }
  }
});