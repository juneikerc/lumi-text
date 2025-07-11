import React, { useState, useEffect } from 'react';
import styles from './WordPopup.module.css';
import { useWords } from '../../hooks/useWords';

interface WordPopupProps {
  word: string;
  onClose: () => void;
}

const WordPopup: React.FC<WordPopupProps> = ({ word, onClose }) => {
  const [translation, setTranslation] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Normalize the word to use as a key
  const lemma = word.trim().toLowerCase().replace(/[^a-z'-]+$/, '');

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
    <div className={styles.popup} onClick={onClose}> {/* Click outside to close */}
      <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking inside */}
        <h3>{word}</h3>
        <p>{isLoading ? 'Translating...' : translation}</p>
        <button onClick={() => handleStatusUpdate('known')} disabled={isLoading}>I know this</button>
        <button onClick={() => handleStatusUpdate('unknown')} disabled={isLoading}>I don't know this</button>
        <button onClick={onClose} className={styles.closeButton}>×</button>
      </div>
    </div>
  );
};

export default WordPopup;

