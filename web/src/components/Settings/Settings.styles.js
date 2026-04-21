import { createUseStyles } from 'react-jss';

export const useStyles = createUseStyles(theme => ({
    container: {
        padding: 24,
        color: theme.colors?.mainText || '#333',
        maxWidth: 640,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
    },
    title: { fontSize: 28, margin: '8px 0' },
    section: {
        background: theme.colors?.paper || '#222',
        borderRadius: 12,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        marginBottom: 12,
    },
    sectionTitle: { margin: 0, fontSize: 18, opacity: 0.8 },
    avatarRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 24,
    },
    avatarActions: {
        display: 'flex',
        gap: 12,
    },
    error: {
        background: '#ff4e4e',
        color: '#fff',
        padding: 12,
        borderRadius: 8,
        textAlign: 'center',
    },
    message: {
        background: 'rgba(80, 200, 120, 0.2)',
        color: theme.colors?.mainText || '#333',
        padding: 12,
        borderRadius: 8,
        textAlign: 'center',
    },
}));
