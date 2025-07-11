import { forwardRef } from 'react';
import styles from './AudioPlayer.module.css';

interface AudioPlayerProps {
  audioUrl: string;
}

const AudioPlayer = forwardRef<HTMLAudioElement, AudioPlayerProps>(({ audioUrl }, ref) => {
  return (
    <div className={styles.playerContainer}>
      <audio ref={ref} src={audioUrl} controls className={styles.audioPlayer} />
    </div>
  );
});

export default AudioPlayer;
