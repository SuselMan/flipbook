import { useEffect, useState, useCallback } from 'react';
import Shortcuts from '../modules/Shortcuts/Shortcuts';
import { formatCombo } from '../modules/Shortcuts/combo';

export const useBindings = () => {
    const [bindings, setBindings] = useState(() => Shortcuts?.getAllBindings() || {});
    useEffect(() => {
        if (!Shortcuts) return;
        return Shortcuts.subscribe(() => setBindings(Shortcuts.getAllBindings()));
    }, []);
    return bindings;
};

export const useTooltip = () => {
    const bindings = useBindings();
    return useCallback((label, action) => {
        if (!action) return label;
        const combo = bindings[action];
        if (!combo) return label;
        return `${label} (${formatCombo(combo)})`;
    }, [bindings]);
};
