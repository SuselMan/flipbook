import { createUseStyles } from 'react-jss';

export const useStyles = createUseStyles(theme => {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
    },
    paper: {
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
    bottomTools: {
      display: 'flex',
      justifyContent: 'center',
    },
    colorPicker: {
      borderRadius: '8px!important',
      border: '0!important',
      padding: '0!important',
      opacity: '1!important',
      '& input': {
        display: 'none',
      },
      '& > div': {
        zIndex: 200,
      },
      '&:before': {
        backgroundColor: theme.colors.paper
      },
      '&:after': {
        backgroundColor: theme.colors.paper
      }
    }
  }
});