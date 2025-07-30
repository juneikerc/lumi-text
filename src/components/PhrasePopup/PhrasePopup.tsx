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
    // Para cancelar el fetch si el componente se desmonta o selectedText cambia
    const controller = new AbortController();
    const signal = controller.signal;

    if (selectedText) {
      // 1. Establecer isLoading a true al inicio para ambas ramas
      setIsLoading(true);

      if ("Translator" in self) {
        const translateWithChromeAPI = async () => {
          try {
            // @ts-expect-error Translator is a new Chrome API not in TS types yet
            const translator = await Translator.create({
              sourceLanguage: "en",
              targetLanguage: "es",
            });
            const result = await translator.translate(selectedText);
            setTranslation(result);
          } catch (error) {
            console.error("Chrome Translation API error:", error);
            setTranslation("Translation failed.");
          } finally {
            setIsLoading(false);
          }
        };

        translateWithChromeAPI();
      } else {
        // Branch de fallback con fetch
        fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(selectedText)}&langpair=en|es`,
          { signal } // 2. Pasar el signal al fetch
        )
          .then((response) => response.json())
          .then((data) => {
            if (data.responseData) {
              setTranslation(data.responseData.translatedText);
            } else {
              setTranslation("No translation found.");
            }
          })
          .catch((error) => {
            // Ignorar errores de cancelación
            if (error.name !== "AbortError") {
              console.error("Translation error:", error);
              setTranslation("Translation failed.");
            }
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    }

    // 3. Función de limpieza para cancelar la petición
    return () => {
      controller.abort();
    };
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
