import React from 'react';
import { useWords } from '../../hooks/useWords';
import styles from './Word.module.css';

interface WordProps {
  word: string;
  onWordClick: (word: string, e: React.MouseEvent) => void;
}

const Word: React.FC<WordProps> = ({ word, onWordClick }) => {
  const { wordStatuses } = useWords();

  const wordInfo = wordStatuses[word.toLowerCase()];
  const className = `${styles.word} ${
    wordInfo?.status === 'unknown' ? styles.unknown : ''
  }`.trim();

  return (
    <span className={className} onClick={(e) => onWordClick(word, e)}>
      {word}
    </span>
  );
};

export default Word;
