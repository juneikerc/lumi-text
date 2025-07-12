import React from "react";
import { Link } from "react-router-dom";
import AudioPlayer from "../AudioPlayer/AudioPlayer";
import styles from "./styles.module.css";

interface HeaderReaderPageProps {
  fontSize: number;
  setFontSize: (value: number) => void;
  contentWidth: number;
  setContentWidth: (value: number) => void;
  audioSrc: string | null;
  playbackRate: number;
  audioPlayerRef: React.RefObject<HTMLAudioElement | null>;
  audioInputRef: React.RefObject<HTMLInputElement | null>;
  handleAudioFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const HeaderReaderPage: React.FC<HeaderReaderPageProps> = ({
  fontSize,
  setFontSize,
  contentWidth,
  setContentWidth,
  audioSrc,
  playbackRate,
  audioPlayerRef,
  audioInputRef,
  handleAudioFileChange,
}) => {
  return (
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
        <div className={[styles.settingControl, styles.contentWidth].join(" ")}>
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
              <span className={styles.playbackRate}>
                {playbackRate.toFixed(1)}x
              </span>
            </>
          )}
          <button
            onClick={() => audioInputRef.current?.click()}
            className={styles.addAudioButton}
          >
            {audioSrc ? "Change Audio" : "Add Audio"}
          </button>
          <input
            type="file"
            accept="audio/*"
            ref={audioInputRef}
            onChange={handleAudioFileChange}
            style={{ display: "none" }}
          />
        </div>
      </div>
    </header>
  );
};

export default HeaderReaderPage;
