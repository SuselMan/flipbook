import { createUseStyles } from 'react-jss';

export const useStyles = createUseStyles(theme => {
  return {
    button: {
      position: 'relative',
      margin: 32,
      cursor: 'pointer',
      backgroundColor: theme.colors.mainBackground,
      width: '48px',
      height: '48px',
      borderRadius: '24px',
      color: theme.colors.mainText,
      fontSize: '1.5em',
      boxShadow:  `13px 13px 26px ${theme.colors.dropShadowDark}, -13px -13px 26px ${theme.colors.dropShadowLight}`,
      border: 'none',

      '&:hover': {
        fontSize: '1.5em',
        transform: 'scale(1.05)'
      },
      '&:active': {
        outline: 'none',
        fontSize: '1.5em',
        boxShadow:  `13px 13px 26px ${theme.colors.dropShadowLight}, -13px -13px 26px ${theme.colors.dropShadowDark}`,
      },
      '&:focus': {
        outline: 'none'
      },
      '&.pressed': {
        boxShadow:  `13px 13px 26px ${theme.colors.dropShadowLight}, -13px -13px 26px ${theme.colors.dropShadowDark}`,
      },
      '&>*': {
        width: 20,
        height: 20,
      },
      transition: 'box-shadow 0.5s'
    },
    withIcon: {
      '&>*': {
        width: 20,
        height: 20,
        fill: theme.colors.mainText,
        stroke: theme.colors.mainText,
        color: theme.colors.mainText,
      }
    },
    small: {
      margin: '8px 8px',
      width: 40,
      height: 40,
      '&>*': {
        width: 18,
        height: 18,
      },
    },
  }
});