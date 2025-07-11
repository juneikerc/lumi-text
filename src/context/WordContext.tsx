import React, { useMemo, type ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { WordContext, type WordStatusMap } from '../types/context';

export const WordProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const words = useLiveQuery(() => db.words.toArray(), []);

  const wordStatuses = useMemo(() => {
    if (!words) return {};
    return words.reduce((acc, word) => {
      acc[word.lemma] = word;
      return acc;
    }, {} as WordStatusMap);
  }, [words]);

  const updateWordStatus = async (lemma: string, status: 'known' | 'unknown', translation: string) => {
    await db.words.put({ lemma, status, translation });
  };

  return (
    <WordContext.Provider value={{ wordStatuses, updateWordStatus }}>
      {children}
    </WordContext.Provider>
  );
};


