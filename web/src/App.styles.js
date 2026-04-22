import { createUseStyles } from 'react-jss';

export const useStyles = createUseStyles(theme => {
  return {
    '@global': {
      'body, html, #root': {
        width: '100%',
        minHeight: '100%',
      },
      body: {
        background: theme.colors.mainBackground,
        color: theme.colors.mainText,
        margin: 0,
        fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif`,
        '-webkit-font-smoothing': 'antialiased',
        '-moz-osx-font-smoothing': 'grayscale'
      },
      main: {
        width: '100%',
        minHeight: '100vh',
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