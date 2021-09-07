import { createUseStyles } from 'react-jss';

export const useStyles = createUseStyles(theme => {
  return {
    '@global': {
      'body, html, #root': {
        width: '100%',
        height: '100%'
      },
      body: {
        background: theme.colors.mainBackground,
        margin: 0,
        fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif`,
        '-webkit-font-smoothing': 'antialiased',
        '-moz-osx-font-smoothing': 'grayscale'
      },
      main: {
        transform: 'translateX(-50%)',
        left: '50%',
        position: 'absolute',
        width: '60%',
        minWidth: '1024px',
      },
      a: {
        textDecoration: 'none'
      },
    },
    app: {
      display: 'block',
    }
  }
});