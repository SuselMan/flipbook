import { createUseStyles } from 'react-jss';

export const multipleSize = 15;
export const borderSize = 2;
export const useStyles = createUseStyles(theme => {
    return {
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
            top: '50%',
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
            borderRadius: '10px 0 0 10px',
            margin: -(borderSize/2),
            height: `calc(100% - ${borderSize}px + 10px)`,
            backgroundColor: 'transparent',
            //opacity: 0.5,
            position: 'absolute',
            top: -5,
            zIndex:  199,
            border: `${borderSize}px solid ${theme.colors.buttonBackground}`,
            borderStyle: 'solid none solid solid',
            pointerEvents: 'none',
        },
        'veilRight': {
            borderStyle: 'solid solid solid none',
            borderRadius: '0px 10px 10px 0px',
        }
    }
});