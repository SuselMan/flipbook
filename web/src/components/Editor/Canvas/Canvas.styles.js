import { createUseStyles } from 'react-jss';

export const useStyles = createUseStyles(theme => {
    return {
        paper: {
            backgroundColor: theme.colors.paper,
            boxShadow: `20px 20px 41px ${theme.colors.dropShadowDark}, -20px -20px 41px ${theme.colors.dropShadowLight}`,
            borderRadius: 3,
        },
        scene: {
            cursor: 'crosshair'
        }
    }
});