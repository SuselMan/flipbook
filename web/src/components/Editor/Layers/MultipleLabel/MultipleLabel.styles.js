import { createUseStyles } from 'react-jss';

export const multipleSize = 15;
export const borderSize = 0;
export const useStyles = createUseStyles(theme => {
    return {
        container: {
            position: 'absolute',
            top:0,
            marginTop: -4,
        },
        multipleLabel: {
            backgroundColor: theme.colors.buttonBackground,
            position: 'absolute',
            color: theme.colors.paper,
            cursor: 'move',
            zIndex:  200,
            width: multipleSize,
            height: multipleSize,
            borderRadius: multipleSize,
            transform: 'translate(-50%, -50%)',
            //transition: 'all 0.1s',
            top: '0',
            border: 'none',
            '&:hover': {
                // animationName: '$multipleHover',
                // animationDuration: '0.2s',
                backgroundColor: theme.colors.hoverButtonBackground,
                outline: `1px solid ${theme.colors.hoverButtonBackground}`
            }
        },

        // '@keyframes multipleHover': {
        //     '0%': {transform: 'translateX(0)'},
        //     '33%': {transform: 'translateX(-1px)'},
        //     '66%': {transform: 'translateX(1px)'},
        //     '100%': {transform: 'translateX(0)'},
        // },

        rightLabel: {
            right: 0,
            transform: 'translate(50%, -50%)',
        },

        veil: {
            //transition: 'all 0.2s',
            margin: 0,
            height: 2,
            backgroundColor: theme.colors.buttonBackground,
            position: 'absolute',
            zIndex:  199,
            pointerEvents: 'none',
        }
    }
});