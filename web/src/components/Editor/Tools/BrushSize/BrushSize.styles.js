import { createUseStyles } from 'react-jss';

export const useStyles = createUseStyles(theme => {
    return {
        container: {
            display: 'flex',
            flexDirection: 'column',
            width: 200,
            backgroundColor: theme.colors.paper,
            padding: '10px 20px',
            borderRadius: 8,
            minHeight: 200,
        },
        slider: {

        },
        brushContainer: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            minHeight: 150,
            border: `1px solid ${theme.colors.dropShadowDark}`,
            borderRadius: '8px',
            margin: '8px 0'
        },
        brush: {
            borderRadius: '100%',
            backgroundColor: theme.colors.mainText
        },
        brushSize: {
            color: theme.colors.mainText,
            textAlign: 'center',
            margin: '8px 0'
        }
    }
});