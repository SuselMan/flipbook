import {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useRecoilValue,
} from 'recoil';

export const userDataAtom = atom({
    key: 'userData',
    default: null,
});

export const userNameSelector = selector({
    key: 'userName',
    get: ({get}) => {
        return get(userDataAtom)?.name;
    },
});