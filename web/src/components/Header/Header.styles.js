import { createUseStyles } from 'react-jss';

const HEADER_HEIGHT = 128;

export const useStyles = createUseStyles(theme => {
  return {
    header: {
      height: HEADER_HEIGHT,
      '& > nav': {
        width: '100%',
        height: HEADER_HEIGHT,
        '& > *': {
          display: 'flex',
          position: 'absolute',
          height: HEADER_HEIGHT,
          alignItems: 'center'
        },
        '& a': {
          color: theme.colors.mainText
        }
      }
    },
    bold: {
      fontWeight: 'bold',
    },
    leftPanel: {
      left: 0
    },
    centerPanel: {
      transform: 'translateX(-50%)',
      left: '50%',
    },
    rightPanel: {
      right: 0
    },
    link: {
      marginRight: '32px',
      '&:last-child': {
        marginRight: 0
      },
      boxShadow:  `13px 13px 26px ${theme.colors.dropShadowLight}, -13px -13px 26px ${theme.colors.dropShadowDark}`,
    },
    addButton: {
      cursor: 'pointer',
      transition: 'all 0.5s ease-out',
      backgroundColor: theme.colors.buttonBackground,
      width: '64px',
      height: '64px',
      borderRadius: '32px',
      color: theme.colors.buttonText,
      fontSize: '2em',
      //TODO: use all colores from theme here
      boxShadow:  `13px 13px 26px ${theme.colors.dropShadowDark}, -13px -13px 26px ${theme.colors.dropShadowLight}`,
      border: `2px solid ${theme.colors.mainBackground}`,
      '&:hover': {
        backgroundColor: theme.colors.hoverButtonBackground,
        fontSize: '2.5em',
        transform: 'rotate(360deg)',
      },
      '&:active': {
        backgroundColor: theme.colors.activeButtonBackground,
        outline: 'none',
        fontSize: '2em',
        transition: 'none',
      },
      '&:focus': {
        outline: 'none'
      },
    },
    selected: {
      color: `${theme.colors.buttonBackground}!important`,
      fontWeight: 'bold'
    }
  }
});