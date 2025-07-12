import React, { useState, useEffect, useRef } from 'react';
import styles from './WordPopup.module.css';

interface WordPopupProps {
  word: string;
  position: { top: number; left: number };
  onClose: () => void;
  onMarkAsKnown: (word: string) => void;
  onMarkAsUnknown: (word: string) => void;
}

const WordPopup: React.FC<WordPopupProps> = ({ word, position, onClose, onMarkAsKnown, onMarkAsUnknown }) => {
  const normalizedWord = word.trim().toLowerCase().replace(/[^a-z'-]+$/, '');
  const lemma = normalizedWord;
  const [translation, setTranslation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lemma) {
      setIsLoading(true);
      fetch(`https://api.mymemory.translated.net/get?q=${lemma}&langpair=en|es`)
        .then(response => response.json())
        .then(data => {
          if (data.responseData) {
            setTranslation(data.responseData.translatedText);
          } else {
            setTranslation('No translation found.');
          }
        })
        .catch(error => {
          console.error('Translation error:', error);
          setTranslation('Translation failed.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [lemma]);

  // Prevent clicks inside the popup from closing it
  const handlePopupClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!lemma) return null;

    return (
    <div
      className={styles.popupContainer}
      style={{ top: position.top, left: position.left }}
      ref={popupRef}
      onClick={handlePopupClick}
    >
      <h3 className={styles.wordTitle}>{normalizedWord}</h3>
      {isLoading ? (
        <p className={styles.loading}>Translating...</p>
      ) : (
        <p className={styles.translation}>{translation}</p>
      )}
      <div className={styles.actions}>
        <button onClick={() => onMarkAsKnown(lemma)} className={styles.knownButton}>
          Known
        </button>
        <button onClick={() => onMarkAsUnknown(lemma)} className={styles.unknownButton}>
          Unknown
        </button>
      </div>
      <button onClick={onClose} className={styles.closeButton}>×</button>
    </div>
  );
};

export default WordPopup;
