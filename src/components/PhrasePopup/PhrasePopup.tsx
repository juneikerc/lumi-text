import React, { useState, useEffect } from 'react';
import styles from './PhrasePopup.module.css';

interface PhrasePopupProps {
  selectedText: string;
  position: { top: number; left: number };
  onClose: () => void;
}

const PhrasePopup: React.FC<PhrasePopupProps> = ({ selectedText, position, onClose }) => {
  const [translation, setTranslation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTranslation = async () => {
      if (!selectedText) return;
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(selectedText)}&langpair=en|es`
        );
        const data = await response.json();
        if (data.responseData) {
          setTranslation(data.responseData.translatedText);
        } else {
          setTranslation('No se encontró traducción.');
        }
      } catch (error) {
        console.error('Translation API error:', error);
        setTranslation('Error al traducir.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslation();
  }, [selectedText]);

  return (
    <div
      className={styles.popupContainer}
      style={{ top: position.top, left: position.left }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.selectedText}>{selectedText}</div>
      <div className={styles.translation}>
        {isLoading ? (
          <span className={styles.loading}>Translating...</span>
        ) : (
          translation
        )}
      </div>
      <button onClick={onClose} className={styles.closeButton}>×</button>
    </div>
  );
};

export default PhrasePopup;
