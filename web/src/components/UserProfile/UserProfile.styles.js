import { createUseStyles } from 'react-jss';

export const useStyles = createUseStyles(theme => ({
    container: {
        padding: 24,
        color: theme.colors?.mainText || '#333',
        maxWidth: 1200,
        margin: '0 auto',
    },
    headerCard: {
        display: 'flex',
        gap: 24,
        padding: 24,
        background: theme.colors?.paper || '#222',
        borderRadius: 12,
        marginBottom: 24,
        alignItems: 'flex-start',
    },
    headerText: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
    },
    displayName: {
        margin: 0,
        fontSize: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
    },
    flag: {
        fontSize: 24,
    },
    handle: {
        opacity: 0.6,
        fontSize: 16,
    },
    bio: {
        margin: '4px 0',
        maxWidth: 640,
        lineHeight: 1.4,
    },
    stats: {
        display: 'flex',
        gap: 16,
        opacity: 0.8,
        fontSize: 14,
        flexWrap: 'wrap',
    },
    sectionTitle: {
        fontSize: 18,
        opacity: 0.7,
        margin: '24px 0 12px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 16,
    },
    card: {
        backgroundColor: theme.colors?.paper || '#222',
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
    thumbWrap: {
        aspectRatio: '16 / 10',
        backgroundColor: '#fff',
        overflow: 'hidden',
        display: 'block',
    },
    thumb: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
    },
    thumbPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#444',
    },
    meta: {
        padding: 12,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
    },
    name: {
        fontWeight: 500,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: 'inherit',
        textDecoration: 'none',
        flex: 1,
        '&:hover': { textDecoration: 'underline' },
    },
    status: {
        opacity: 0.6,
        textAlign: 'center',
        padding: 24,
    },
}));
