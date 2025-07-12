import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import Word from "../components/Word/Word";
import WordPopup from "../components/WordPopup/WordPopup";
import PhrasePopup from "../components/PhrasePopup/PhrasePopup";
import HeaderReaderPage from "../components/HeaderReaderPage";

import styles from "./ReaderPage.module.css";

const ReaderPage: React.FC = () => {
  const { textId } = useParams<{ textId: string }>();
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  const [fontSize, setFontSize] = useState(1.2); // in rem
  const [contentWidth, setContentWidth] = useState(800); // in px
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [selectedPhrase, setSelectedPhrase] = useState<string>("");
  const [phrasePopupPosition, setPhrasePopupPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const text = useLiveQuery(() => {
    if (!textId) return undefined;
    return db.texts.get(Number(textId));
  }, [textId]);

  useEffect(() => {
    if (text?.audioData) {
      const url = URL.createObjectURL(text.audioData);
      setAudioSrc(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setAudioSrc(null);
    }
  }, [text?.audioData]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!audioPlayerRef.current) return;

      if (event.code === "Space") {
        event.preventDefault();
        if (audioPlayerRef.current.paused) {
          audioPlayerRef.current.play();
        } else {
          audioPlayerRef.current.pause();
        }
      } else if (event.code === "ArrowRight") {
        event.preventDefault();
        const newRate = Math.min(audioPlayerRef.current.playbackRate + 0.1, 2);
        audioPlayerRef.current.playbackRate = newRate;
        setPlaybackRate(newRate);
      } else if (event.code === "ArrowLeft") {
        event.preventDefault();
        const newRate = Math.max(
          audioPlayerRef.current.playbackRate - 0.1,
          0.5
        );
        audioPlayerRef.current.playbackRate = newRate;
        setPlaybackRate(newRate);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleWordClick = (word: string, e: React.MouseEvent) => {
    // Prevent popup when selecting text
    if (window.getSelection()?.toString()) {
      return;
    }
    setSelectedWord(word);
    setPopupPosition({ top: e.clientY, left: e.clientX });
    // Hide phrase popup if a word is clicked
    setSelectedPhrase("");
    setPhrasePopupPosition(null);
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    // Only trigger for multi-word selections
    if (selection && selectedText && selectedText.includes(" ")) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setSelectedPhrase(selectedText);
      setPhrasePopupPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX,
      });

      // Hide word popup if a phrase is selected
      setSelectedWord(null);
      setPopupPosition(null);
    } else {
      // If the selection is not a phrase, ensure the phrase popup is closed.
      setSelectedPhrase("");
      setPhrasePopupPosition(null);
    }
  };

  if (!text) {
    return <div>Loading text... or text not found.</div>;
  }

  const handleMarkAsKnown = async (word: string) => {
    await db.words.put({ lemma: word.toLowerCase(), status: "known" });
    handleClosePopup();
  };

  const handleMarkAsUnknown = async (word: string, translation: string) => {
    await db.words.put({
      lemma: word.toLowerCase(),
      status: "unknown",
      translation,
    });
    handleClosePopup();
  };

  const handleClosePopup = () => {
    setSelectedWord(null);
    setPopupPosition(null);
  };

  const handleClosePhrasePopup = () => {
    setSelectedPhrase("");
    setPhrasePopupPosition(null);
  };

  // Process the text to make each word interactive
  const wordsAndSpaces = text.content.split(/(\s+)/);

  const handleAudioFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && text?.id) {
      await db.texts.update(text.id, { audioData: file });
    }
  };

  return (
    <div className={styles.pageContainer}>
      <HeaderReaderPage
        fontSize={fontSize}
        setFontSize={setFontSize}
        contentWidth={contentWidth}
        setContentWidth={setContentWidth}
        audioSrc={audioSrc}
        playbackRate={playbackRate}
        audioPlayerRef={audioPlayerRef}
        audioInputRef={audioInputRef}
        handleAudioFileChange={handleAudioFileChange}
      />
      <main
        className={styles.content}
        style={{ fontSize: `${fontSize}rem`, maxWidth: `${contentWidth}px` }}
        onMouseUp={handleMouseUp}
      >
        {wordsAndSpaces.map((segment, index) => {
          if (segment.trim() === "") {
            return <span key={index}>{segment}</span>;
          }
          return (
            <Word key={index} word={segment} onWordClick={handleWordClick} />
          );
        })}
      </main>
      {selectedWord && popupPosition && (
        <WordPopup
          word={selectedWord}
          position={popupPosition}
          onClose={handleClosePopup}
          onMarkAsKnown={handleMarkAsKnown}
          onMarkAsUnknown={handleMarkAsUnknown}
        />
      )}

      {selectedPhrase && phrasePopupPosition && (
        <PhrasePopup
          selectedText={selectedPhrase}
          position={phrasePopupPosition}
          onClose={handleClosePhrasePopup}
        />
      )}
    </div>
  );
};

export default ReaderPage;
