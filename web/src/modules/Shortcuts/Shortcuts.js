import { shortcuts } from '../../configs/shortcuts';

const modKeys = ['Control', 'Shift', 'Alt', 'Meta', 'Command'];
const emptyShortcut = { key: '', code: '', ctrlKey: false, shiftKey: false, altKey: false, metaKey: false };

class ShortcutsHandler {
    constructor() {
        this.currentShortcut = { ...emptyShortcut };
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);

        window.document.addEventListener('keydown', this.onKeyDown);
        window.document.addEventListener('keyup', this.onKeyUp);
        this.listeners = {

        };
    }

    on(name, callback) {
        if(!this.listeners[name]) {
            this.listeners[name] = [];
        }
        this.listeners[name].push(callback);
    }

    triggerShortcut(name) {
        if(this.listeners[name] && this.listeners[name].length) {
            this.listeners[name].forEach(callback => callback());
        }
    }

    _transformCode(evt) {
        switch (evt.code) {
            case 'NumpadEnter':
                return 'Enter';
            case 'NumpadDivide':
                return 'Slash';
            default:
                return evt.code;
        }
    }

    onKeyDown(evt) {
        if (!evt.isTrusted) return;
        if (evt.target.nodeName === 'INPUT'
            || evt.target.nodeName === 'TEXTAREA'
            || evt.target.contentEditable === 'true') {
            return;
        }

        if (evt.ctrlKey) this.currentShortcut.ctrlKey = true;
        if (evt.shiftKey) this.currentShortcut.shiftKey = true;
        if (evt.altKey) this.currentShortcut.altKey = true;
        if (evt.metaKey) this.currentShortcut.metaKey = true;

        if (modKeys.indexOf(evt.key) < 0) {
            this.currentShortcut.key = evt.key;
            this.currentShortcut.code = this._transformCode(evt);
            const scName = this._findShortcutName(this.currentShortcut);
            if (scName) {
                this.triggerShortcut(scName);
                evt.preventDefault();
            }
            this.currentShortcut = { ...emptyShortcut };
        }
    }

    onKeyUp(evt) {
        if (!evt.isTrusted) return;

        const releasedShortcut = {
            key: '',
            code: '',
            ctrlKey: false
        };

        releasedShortcut.key = evt.key;
        releasedShortcut.code = this._transformCode(evt);
        releasedShortcut.onKeyUp = true;

        if (evt.ctrlKey) releasedShortcut.ctrlKey = true;
        const scName = this._findShortcutName(releasedShortcut);
        this.triggerShortcut(scName);
        evt.preventDefault();

        this.currentShortcut = { ...emptyShortcut };
    }

    _findShortcutName(shortcut) {
        let result = null;
        Object.keys(shortcuts).forEach((scName) => {
            if (shortcuts[scName] && shortcut.code === shortcuts[scName].code) {
                if (!!shortcut.ctrlKey === !!shortcuts[scName].ctrlKey
                    && !!shortcut.shiftKey === !!shortcuts[scName].shiftKey
                    && !!shortcut.altKey === !!shortcuts[scName].altKey
                    && !!shortcut.metaKey === !!shortcuts[scName].metaKey
                    && !!shortcut.onKeyUp === !!shortcuts[scName].onKeyUp
                ) {
                    result = scName;
                }
            }
        });
        return result;
    }
}

const ShortCuts = new ShortcutsHandler();
export default ShortCuts;
