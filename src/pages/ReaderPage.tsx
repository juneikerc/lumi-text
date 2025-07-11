import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import Word from '../components/Word/Word';
import AudioPlayer from '../components/AudioPlayer/AudioPlayer';

const ReaderPage: React.FC = () => {
  const audioInputRef = React.useRef<HTMLInputElement>(null);
  const { textId } = useParams<{ textId: string }>();
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
    <div>
      <Link to="/">Back to Library</Link>
      <h1>{text.title}</h1>
      {audioSrc && <AudioPlayer audioUrl={audioSrc} />}
      <button onClick={() => audioInputRef.current?.click()}>Add/Change Audio</button>
      <input
        type="file"
        accept="audio/*"
        ref={audioInputRef}
        onChange={handleAudioFileChange}
        style={{ display: 'none' }}
      />
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', marginTop: '20px' }}>
        {wordsAndSpaces.map((segment, index) => {
          if (segment.trim() === '') {
            // It's a space or newline
            return <span key={index}>{segment}</span>;
          }
          // It's a word
          return <Word key={index} word={segment} />;
        })}
      </div>
    </div>
  );
};

export default ReaderPage;

