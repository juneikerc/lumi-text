import { useContext } from 'react';
import { WordContext } from '../types/context';

export const useWords = () => {
  const context = useContext(WordContext);
  if (context === undefined) {
    throw new Error('useWords must be used within a WordProvider');
  }
  return context;
};
