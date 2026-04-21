import React from 'react';

const COLORS = [
    '#f94144', '#f3722c', '#f8961e', '#f9844a', '#f9c74f',
    '#90be6d', '#43aa8b', '#4d908e', '#577590', '#277da1',
];

const hashString = (s = '') => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return Math.abs(h);
};

const initials = (name = '') => {
    const t = String(name).trim();
    if (!t) return '?';
    const parts = t.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return t.slice(0, 2).toUpperCase();
};

const Avatar = ({ src, username, displayName, size = 40, className, style }) => {
    const name = displayName || username || '';
    const color = COLORS[hashString(username || name) % COLORS.length];
    const label = initials(name);

    const base = {
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        userSelect: 'none',
        ...style,
    };

    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={className}
                style={{ ...base, objectFit: 'cover' }}
            />
        );
    }

    return (
        <span
            className={className}
            style={{
                ...base,
                background: color,
                color: '#fff',
                fontWeight: 600,
                fontSize: Math.max(12, size * 0.4),
            }}
        >
            {label}
        </span>
    );
};

export default Avatar;
