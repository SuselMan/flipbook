import {createUseStyles} from 'react-jss';

export const useStyles = createUseStyles(theme => {
    return {
        baseButton: {
            backgroundColor: theme.colors.buttonBackground,
            color: theme.colors.paper,
            border: 'none',
            fontSize: 20,
            padding: 20,
            lineHeight: '20px',
            borderRadius: '100px',
            height: '60px',
            minWidth: '300px',
            fontFamily: 'Segoe UI',
            cursor: 'pointer',
            '&:hover': {
                backgroundColor: theme.colors.hoverButtonBackground,
            },
            '&:active': {
                backgroundColor: theme.colors.activeButtonBackground,
            }
        },

        default: {},
        small: {
            padding: 15,
            minWidth: 150,
            height: 50,
            lineHeight: 1,
        },

        primary: {},
        secondary: {
            backgroundColor: theme.colors.selectedFrame,
            '&:hover': {
                backgroundColor: theme.colors.selectedFrameHover,
            },
            '&:active': {
                backgroundColor: theme.colors.selectedFrame,
            }
        },
    }
});