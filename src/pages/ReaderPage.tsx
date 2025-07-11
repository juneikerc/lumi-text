import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import Word from '../components/Word/Word';
import AudioPlayer from '../components/AudioPlayer/AudioPlayer';
import styles from './ReaderPage.module.css';

const ReaderPage: React.FC = () => {
  const { textId } = useParams<{ textId: string }>();
  const audioInputRef = React.useRef<HTMLInputElement>(null);
  const audioPlayerRef = React.useRef<HTMLAudioElement>(null);

  const [fontSize, setFontSize] = useState(1.2); // in rem
  const [contentWidth, setContentWidth] = useState(800); // in px
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);

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

      if (event.code === 'Space') {
        event.preventDefault();
        if (audioPlayerRef.current.paused) {
          audioPlayerRef.current.play();
        } else {
          audioPlayerRef.current.pause();
        }
      } else if (event.code === 'ArrowRight') {
        event.preventDefault();
        const newRate = Math.min(audioPlayerRef.current.playbackRate + 0.1, 2);
        audioPlayerRef.current.playbackRate = newRate;
        setPlaybackRate(newRate);
      } else if (event.code === 'ArrowLeft') {
        event.preventDefault();
        const newRate = Math.max(audioPlayerRef.current.playbackRate - 0.1, 0.5);
        audioPlayerRef.current.playbackRate = newRate;
        setPlaybackRate(newRate);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!text) {
    return <div>Loading text... or text not found.</div>;
  }

  // Process the text to make each word interactive
  const wordsAndSpaces = text.content.split(/(\s+)/);

  const handleAudioFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && text?.id) {
      await db.texts.update(text.id, { audioData: file });
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <Link to="/">← Back to Library</Link>

        <div className={styles.settingsSection}>
            <div className={styles.settingControl}>
              <label htmlFor="fontSize">Font Size</label>
              <input 
                type="range" 
                id="fontSize" 
                min="1" 
                max="2" 
                step="0.1" 
                value={fontSize}
                onChange={(e) => setFontSize(parseFloat(e.target.value))}
              />
            </div>
            <div className={styles.settingControl}>
              <label htmlFor="contentWidth">Width</label>
              <input 
                type="range" 
                id="contentWidth" 
                min="500" 
                max="1200" 
                step="50" 
                value={contentWidth}
                onChange={(e) => setContentWidth(parseInt(e.target.value))}
              />
            </div>
          </div>

        <div className={styles.headerActions}>
          <div className={styles.audioSection}>
            {audioSrc && (
              <>
                <AudioPlayer ref={audioPlayerRef} audioUrl={audioSrc} />
                <span className={styles.playbackRate}>{playbackRate.toFixed(1)}x</span>
              </>
            )}
            <button onClick={() => audioInputRef.current?.click()} className={styles.addAudioButton}>
              {audioSrc ? 'Change Audio' : 'Add Audio'}
            </button>
            <input
              type="file"
              accept="audio/*"
              ref={audioInputRef}
              onChange={handleAudioFileChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </header>
      <main 
        className={styles.content}
        style={{ fontSize: `${fontSize}rem`, maxWidth: `${contentWidth}px` }}
      >
        {wordsAndSpaces.map((segment, index) => {
          if (segment.trim() === '') {
            return <span key={index}>{segment}</span>;
          }
          return <Word key={index} word={segment} />;
        })}
      </main>
    </div>
  );
};

export default ReaderPage;
