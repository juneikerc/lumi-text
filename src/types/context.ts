import { createContext } from 'react';
import type { Word } from '../db/db';

export interface WordStatusMap {
    [lemma: string]: Word;
}

export interface WordContextType {
    wordStatuses: WordStatusMap;
    updateWordStatus: (lemma: string, status: 'known' | 'unknown', translation: string) => Promise<void>;
}

export const WordContext = createContext<WordContextType | undefined>(undefined);
