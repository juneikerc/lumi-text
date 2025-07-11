import React, { useState, useEffect } from 'react';
import styles from './WordPopup.module.css';
import { useWords } from '../../hooks/useWords';

interface WordPopupProps {
  word: string;
  onClose: () => void;
}

const WordPopup: React.FC<WordPopupProps> = ({ word, onClose }) => {
  const normalizedWord = word.trim().toLowerCase().replace(/[^a-z'-]+$/, '');
  const lemma = normalizedWord;
  const [translation, setTranslation] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTranslation = async () => {
      if (!lemma) return;
      setIsLoading(true);
      try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${lemma}&langpair=en|es`);
        const data = await response.json();
        if (data.responseData) {
          setTranslation(data.responseData.translatedText);
        } else {
          setTranslation('No translation found.');
        }
      } catch (error) {
        console.error('Translation fetch error:', error);
        setTranslation('Failed to fetch translation.');
      }
      setIsLoading(false);
    };

    fetchTranslation();
  }, [lemma]);

    const { updateWordStatus } = useWords();

  const handleStatusUpdate = async (status: 'known' | 'unknown') => {
    if (isLoading) return;
    await updateWordStatus(lemma, status, translation);
    onClose();
  };

  return (
    <div className={styles.popupOverlay} onClick={onClose}>
      <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        <h2 className={styles.wordTitle}>{normalizedWord}</h2>
        <p className={styles.translation}>{translation || 'Translating...'}</p>
        <div className={styles.actions}>
          <button 
            className={`${styles.statusButton} ${styles.knownButton}`}
            onClick={() => handleStatusUpdate('known')}
          >
            Mark as Known
          </button>
          <button 
            className={`${styles.statusButton} ${styles.unknownButton}`}
            onClick={() => handleStatusUpdate('unknown')}
          >
            Mark as Unknown
          </button>
        </div>
      </div>
    </div>
  );
};

export default WordPopup;

