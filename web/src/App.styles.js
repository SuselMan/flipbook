import { createUseStyles } from 'react-jss';

export const useStyles = createUseStyles(theme => {
  return {
    '@global': {
      'body, html, #root': {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
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
        left: '0',
        position: 'absolute',
        width: '100%',
        height: '100%',
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