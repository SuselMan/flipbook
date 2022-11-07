import {
    RecoilRoot,
    atom,
    selector
} from 'recoil';

export const themeAtom = atom({
    key: 'theme',
    default: localStorage.theme
});