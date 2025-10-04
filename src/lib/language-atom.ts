import { atom } from 'jotai';

export type Language = 'English' | 'Hindi';

export const languageAtom = atom<Language>('English');
