import { createUseStyles } from 'react-jss';

export const useStyles = createUseStyles(theme => ({
    wrapper: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
    },
    button: {
        position: 'relative',
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        backgroundColor: theme.colors.mainBackground,
        color: theme.colors.mainText,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `8px 8px 16px ${theme.colors.dropShadowDark}, -8px -8px 16px ${theme.colors.dropShadowLight}`,
        transition: 'transform 0.15s ease, color 0.2s ease, box-shadow 0.3s ease',
        '&:hover': {
            transform: 'scale(1.06)',
        },
        '&:active': {
            boxShadow: `inset 4px 4px 10px ${theme.colors.dropShadowDark}, inset -4px -4px 10px ${theme.colors.dropShadowLight}`,
        },
        '&:focus': {
            outline: 'none',
        },
        '&:disabled': {
            cursor: 'wait',
            opacity: 0.7,
        },
        '& svg': {
            width: 22,
            height: 22,
            fill: 'currentColor',
            pointerEvents: 'none',
        },
    },
    big: {
        width: 56,
        height: 56,
        boxShadow: `12px 12px 22px ${theme.colors.dropShadowDark}, -12px -12px 22px ${theme.colors.dropShadowLight}`,
        '& svg': {
            width: 28,
            height: 28,
        },
    },
    liked: {
        color: '#ff4e70',
        boxShadow: `inset 4px 4px 10px ${theme.colors.dropShadowDark}, inset -4px -4px 10px ${theme.colors.dropShadowLight}`,
    },
    pop: {
        animation: '$pop 0.32s ease-out',
    },
    '@keyframes pop': {
        '0%':   { transform: 'scale(1)' },
        '35%':  { transform: 'scale(1.28)' },
        '55%':  { transform: 'scale(0.95)' },
        '100%': { transform: 'scale(1)' },
    },
    count: {
        fontSize: 15,
        fontWeight: 500,
        minWidth: 14,
        textAlign: 'left',
        color: theme.colors.mainText,
        userSelect: 'none',
    },
    countBig: {
        fontSize: 18,
    },
}));
