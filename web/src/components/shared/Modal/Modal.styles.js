import {createUseStyles} from 'react-jss';

export const useStyles = createUseStyles(theme => {
    return {
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 2147483647,
            width: '100%',
            height: '100%',
            backgroundColor: theme.colors.modalBackground,
            backdropFilter: 'blur(15px)',
        },
        hidden: {
            display: 'none',
        },
        modalBlock: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: theme.colors.paper,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            padding: 40,
        },
        modalHeader: {
            display: 'flex',
            justifyContent: 'flex-end',
        },
        title: {
            lineHeight: '200%',
            fontSize: 20,
            width: '100%',
        },
        closeButton: {
            padding: 0,
            cursor: 'pointer',
            width: 40,
            height: 40,
            fill: theme.colors.secondText,
            backgroundColor: 'transparent',
            border: 'none',
            '&:hover': {
                fill: theme.colors.mainText,
            },
            '&:active': {
                fill: theme.colors.mainText,
            }
        },
        modalBody: {

        }

    }
});