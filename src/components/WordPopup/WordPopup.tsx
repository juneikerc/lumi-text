import React, { useState, useEffect, useRef } from "react";
import styles from "./WordPopup.module.css";

interface WordPopupProps {
  word: string;
  position: { top: number; left: number };
  onClose: () => void;
  onMarkAsKnown: (word: string) => void;
  onMarkAsUnknown: (word: string, translation: string) => void;
}

const WordPopup: React.FC<WordPopupProps> = ({
  word,
  position,
  onClose,
  onMarkAsKnown,
  onMarkAsUnknown,
}) => {
  const normalizedWord = word
    .trim()
    .toLowerCase()
    .replace(/[^a-z'-]+$/, "");
  const lemma = normalizedWord;
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Para cancelar el fetch si el componente se desmonta o lemma cambia
    const controller = new AbortController();
    const signal = controller.signal;

    if (lemma) {
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
            const result = await translator.translate(lemma);
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
          `https://api.mymemory.translated.net/get?q=${lemma}&langpair=en|es`,
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
        <button
          onClick={() => onMarkAsKnown(lemma)}
          className={styles.knownButton}
        >
          Known
        </button>
        <button
          onClick={() => onMarkAsUnknown(lemma, translation)}
          className={styles.unknownButton}
        >
          Unknown
        </button>
      </div>
      <button onClick={onClose} className={styles.closeButton}>
        ×
      </button>
    </div>
  );
};

export default WordPopup;
