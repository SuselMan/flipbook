import { DEFAULT_SHORTCUTS } from '../../configs/shortcuts';
import { eventToCombo, isModifierOnly, matchesCombo } from './combo';

const STORAGE_KEY = 'hotkeys';

const loadOverrides = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch { return {}; }
};

const saveOverrides = (overrides) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides)); } catch {}
};

const shouldIgnoreTarget = (target) => {
    if (!target) return false;
    const tag = target.nodeName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (target.isContentEditable) return true;
    return false;
};

class ShortcutsManager {
    constructor() {
        this.overrides = loadOverrides();
        this.handlers = new Map();         // action -> handler fn
        this.captureCallback = null;
        this.subscribers = new Set();
        this._onKeyDown = this._onKeyDown.bind(this);
        if (typeof document !== 'undefined') {
            document.addEventListener('keydown', this._onKeyDown);
        }
    }

    on(action, handler) { this.handlers.set(action, handler); }
    off(action) { this.handlers.delete(action); }

    getBinding(action) {
        return this.overrides[action] !== undefined
            ? this.overrides[action]
            : DEFAULT_SHORTCUTS[action] || '';
    }

    getAllBindings() {
        const out = {};
        for (const action of Object.keys(DEFAULT_SHORTCUTS)) {
            out[action] = this.getBinding(action);
        }
        return out;
    }

    // Return action currently bound to `combo` (skip `skipAction` — used when rebinding).
    findConflict(combo, skipAction = null) {
        if (!combo) return null;
        const all = this.getAllBindings();
        for (const [action, bound] of Object.entries(all)) {
            if (action === skipAction) continue;
            if (bound === combo) return action;
        }
        return null;
    }

    setBinding(action, combo) {
        if (!combo) {
            delete this.overrides[action];
            this.overrides[action] = '';    // explicit unbind
        } else {
            this.overrides[action] = combo;
        }
        saveOverrides(this.overrides);
        this._notify();
    }

    resetBinding(action) {
        delete this.overrides[action];
        saveOverrides(this.overrides);
        this._notify();
    }

    resetAll() {
        this.overrides = {};
        saveOverrides(this.overrides);
        this._notify();
    }

    subscribe(fn) {
        this.subscribers.add(fn);
        return () => this.subscribers.delete(fn);
    }

    startCapture(cb) { this.captureCallback = cb; }
    cancelCapture() { this.captureCallback = null; }

    _notify() {
        for (const fn of this.subscribers) {
            try { fn(); } catch {}
        }
    }

    _onKeyDown(e) {
        if (!e.isTrusted) return;

        // Capture mode: first non-modifier keydown becomes the combo.
        if (this.captureCallback) {
            if (e.key === 'Escape') {
                e.preventDefault();
                const cb = this.captureCallback;
                this.captureCallback = null;
                cb(null);   // null = cancelled
                return;
            }
            if (isModifierOnly(e)) return;
            e.preventDefault();
            e.stopPropagation();
            const combo = eventToCombo(e);
            const cb = this.captureCallback;
            this.captureCallback = null;
            cb(combo);
            return;
        }

        if (shouldIgnoreTarget(e.target)) return;

        for (const [action, handler] of this.handlers) {
            const combo = this.getBinding(action);
            if (matchesCombo(e, combo)) {
                e.preventDefault();
                e.stopPropagation();
                handler(e);
                return;
            }
        }
    }
}

const instance = typeof window === 'undefined' ? null : new ShortcutsManager();

export default instance;
export { ShortcutsManager };
