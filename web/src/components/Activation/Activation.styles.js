import { createUseStyles } from 'react-jss';

export const useStyles = createUseStyles(theme => {
    return {
        activationContainer: {
            backgroundColor: theme.colors.paper,
            padding: 100,
            display: 'flex',
            flexDirection: 'column',
            fontSize: 20,
            borderRadius: 5,
            alignItems: 'center',
            boxShadow: '20px 20px 41px #dddfe2, -20px -20px 41px #f9fbfe',
            width: '500px',
            margin: 'auto'
        },
        preloader: {
            fill:  theme.colors.buttonBackground,
            stroke: theme.colors.buttonBackground,
            width: 100,
            height: 100,
        },
        subline: {
            color: theme.colors.secondText,
        },
        error: {
            color: theme.colors.error,
        }
    }
});