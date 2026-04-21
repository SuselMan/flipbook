export const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/i.test(navigator.platform || '');

const MODIFIER_CODES = new Set([
    'ControlLeft', 'ControlRight',
    'ShiftLeft', 'ShiftRight',
    'AltLeft', 'AltRight',
    'MetaLeft', 'MetaRight',
]);

export const isModifierOnly = (e) => MODIFIER_CODES.has(e.code);

// Produce canonical combo string from KeyboardEvent
export const eventToCombo = (e) => {
    if (isModifierOnly(e)) return null;
    const parts = [];
    if (e.ctrlKey || (IS_MAC && e.metaKey)) parts.push('Ctrl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    parts.push(e.code);
    return parts.join('+');
};

export const matchesCombo = (e, combo) => {
    if (!combo) return false;
    const parts = combo.split('+');
    const code = parts[parts.length - 1];
    if (e.code !== code) return false;
    const mods = new Set(parts.slice(0, -1));
    const wantsCtrl = mods.has('Ctrl');
    const gotCtrl = e.ctrlKey || (IS_MAC && e.metaKey);
    if (wantsCtrl !== gotCtrl) return false;
    if (!!e.altKey !== mods.has('Alt')) return false;
    if (!!e.shiftKey !== mods.has('Shift')) return false;
    return true;
};

const CODE_DISPLAY = {
    Space: 'Space',
    ArrowLeft: '←',
    ArrowRight: '→',
    ArrowUp: '↑',
    ArrowDown: '↓',
    Escape: 'Esc',
    Backspace: 'Backspace',
    Delete: 'Del',
    Enter: 'Enter',
    Tab: 'Tab',
    BracketLeft: '[',
    BracketRight: ']',
    Semicolon: ';',
    Quote: "'",
    Comma: ',',
    Period: '.',
    Slash: '/',
    Backslash: '\\',
    Backquote: '`',
    Minus: '-',
    Equal: '=',
};

const displayCode = (code) => {
    if (CODE_DISPLAY[code]) return CODE_DISPLAY[code];
    if (code.startsWith('Key')) return code.slice(3);
    if (code.startsWith('Digit')) return code.slice(5);
    if (code.startsWith('Numpad')) return `Num${code.slice(6)}`;
    return code;
};

export const formatCombo = (combo) => {
    if (!combo) return '';
    const parts = combo.split('+');
    const code = parts[parts.length - 1];
    const mods = parts.slice(0, -1);
    const prettyMods = mods.map((m) => {
        if (IS_MAC) {
            if (m === 'Ctrl') return '⌘';
            if (m === 'Alt') return '⌥';
            if (m === 'Shift') return '⇧';
        }
        return m;
    });
    const sep = IS_MAC ? '' : '+';
    return [...prettyMods, displayCode(code)].join(sep);
};
