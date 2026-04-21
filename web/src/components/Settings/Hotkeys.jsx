import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Shortcuts from '../../modules/Shortcuts/Shortcuts';
import { SHORTCUTS, SHORTCUT_LABELS, DEFAULT_SHORTCUTS } from '../../configs/shortcuts';
import { formatCombo } from '../../modules/Shortcuts/combo';
import BaseButton from '../shared/BaseButton/BaseButton';
import { useStyles } from './Hotkeys.styles';

const Hotkeys = () => {
    const classes = useStyles();
    const [bindings, setBindings] = useState(() => Shortcuts?.getAllBindings() || {});
    const [capturing, setCapturing] = useState(null);
    const [conflict, setConflict] = useState(null);

    useEffect(() => {
        if (!Shortcuts) return;
        return Shortcuts.subscribe(() => setBindings(Shortcuts.getAllBindings()));
    }, []);

    const startCapture = (action) => {
        setConflict(null);
        setCapturing(action);
        Shortcuts.startCapture((combo) => {
            setCapturing(null);
            if (combo === null) return;        // Escape cancels
            const existing = Shortcuts.findConflict(combo, action);
            if (existing) {
                setConflict({ action, combo, takenBy: existing });
                return;
            }
            Shortcuts.setBinding(action, combo);
        });
    };

    const cancelCapture = () => {
        Shortcuts.cancelCapture();
        setCapturing(null);
    };

    const confirmOverride = () => {
        if (!conflict) return;
        Shortcuts.setBinding(conflict.takenBy, '');
        Shortcuts.setBinding(conflict.action, conflict.combo);
        setConflict(null);
    };

    const resetOne = (action) => {
        Shortcuts.resetBinding(action);
    };

    const resetAll = () => {
        if (window.confirm('Reset all shortcuts to defaults?')) {
            Shortcuts.resetAll();
        }
    };

    const isCustom = (action) => bindings[action] !== DEFAULT_SHORTCUTS[action];

    return (
        <div className={classes.container}>
            <div className={classes.header}>
                <h1 className={classes.title}>Hotkeys</h1>
                <Link to="/me/settings" className={classes.back}>← Back to settings</Link>
            </div>

            {conflict && (
                <div className={classes.conflict}>
                    <div>
                        <b>{formatCombo(conflict.combo)}</b> is currently assigned to{' '}
                        <b>{SHORTCUT_LABELS[conflict.takenBy]}</b>.
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <BaseButton size="small" onClick={confirmOverride}>Reassign</BaseButton>
                        <BaseButton size="small" onClick={() => setConflict(null)}>Cancel</BaseButton>
                    </div>
                </div>
            )}

            <table className={classes.table}>
                <tbody>
                    {Object.values(SHORTCUTS).map((action) => (
                        <tr key={action}>
                            <td className={classes.action}>{SHORTCUT_LABELS[action] || action}</td>
                            <td className={classes.comboCell}>
                                <button
                                    type="button"
                                    className={capturing === action ? classes.comboCapturing : classes.combo}
                                    onClick={() => (capturing === action ? cancelCapture() : startCapture(action))}
                                >
                                    {capturing === action
                                        ? 'Press a key… (Esc to cancel)'
                                        : (bindings[action] ? formatCombo(bindings[action]) : '—')}
                                </button>
                            </td>
                            <td className={classes.resetCell}>
                                {isCustom(action) && (
                                    <button
                                        type="button"
                                        className={classes.reset}
                                        onClick={() => resetOne(action)}
                                    >Reset</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: 16 }}>
                <BaseButton size="small" onClick={resetAll}>Reset all to defaults</BaseButton>
            </div>
        </div>
    );
};

export default Hotkeys;
