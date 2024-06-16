import { createUseStyles } from 'react-jss';

export const useStyles = createUseStyles(theme => {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
    },
    paper: {
      width: 1024,
      height: 600,
      backgroundColor: theme.colors.paper,
      boxShadow: '20px 20px 41px #dddfe2, -20px -20px 41px #f9fbfe',
      borderRadius: 3,
    },
    workArea: {
      display: 'flex',
      justifyContent: 'center'
    },
    tools: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    controls: {
      display: 'flex',
      justifyContent: 'center'
    }
  }
});