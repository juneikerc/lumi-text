import React from 'react';
import styles from './AudioPlayer.module.css';

interface AudioPlayerProps {
  audioUrl: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl }) => {
  return (
    <div className={styles.playerContainer}>
      <audio controls src={audioUrl} className={styles.audioPlayer}>
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default AudioPlayer;
