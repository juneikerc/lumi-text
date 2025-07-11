import React, { useState } from 'react';
import styles from './Word.module.css';
import WordPopup from '../WordPopup/WordPopup';
import { useWords } from '../../hooks/useWords';

interface WordProps {
  word: string;
}

const Word: React.FC<WordProps> = ({ word }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { wordStatuses } = useWords();

  // Normalize the word to look it up in the context
  const lemma = word.trim().toLowerCase().replace(/[^a-z'-]+$/, '');
  const wordInfo = wordStatuses[lemma];
  const className = `${styles.word} ${wordInfo?.status === 'unknown' ? styles.unknown : ''}`;

  const handleWordClick = () => {
    // Don't open popup for punctuation-only or empty segments
    if (lemma === '') {
        return;
    }
    setIsPopupOpen(true);
  };

  return (
    <>
      <span className={className} onClick={handleWordClick}>
        {word}
      </span>
      {isPopupOpen && <WordPopup word={word} onClose={() => setIsPopupOpen(false)} />}
    </>
  );
};

export default Word;

