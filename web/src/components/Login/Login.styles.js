import { createUseStyles } from 'react-jss';

export const useStyles = createUseStyles(theme => {
    return {
        container: {
            backgroundColor: theme.colors.paper,
            padding: 100,
            display: 'flex',
            flexDirection: 'column',
            fontSize: 20,
            borderRadius: 5,
            '& > *': {
                margin: '20px 0!important',
                width: '300px'
            },
            alignItems: 'center',
            boxShadow: '20px 20px 41px #dddfe2, -20px -20px 41px #f9fbfe',
            width: '500px',
            margin: 'auto'
        },
        loginButton: {
            backgroundColor: theme.colors.buttonBackground,
            color: theme.colors.paper,
            border: 'none',
            fontSize: 20,
            padding: 20,
            lineHeight: '20px',
            marginTop: '80px!important',
            borderRadius: '100px',
            height: '60px',
            width: '300px',
            fontFamily: 'Segoe UI',
            cursor: 'pointer',
            '&:hover': {
                backgroundColor: theme.colors.hoverButtonBackground,
            },
            '&:active': {
                backgroundColor: theme.colors.activeButtonBackground,
            }
        }
    }
});