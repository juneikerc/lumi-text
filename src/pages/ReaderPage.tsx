import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import Word from '../components/Word/Word';
import AudioPlayer from '../components/AudioPlayer/AudioPlayer';

const ReaderPage: React.FC = () => {
  const audioInputRef = React.useRef<HTMLInputElement>(null);

  const { textId } = useParams<{ textId: string }>();

  const text = useLiveQuery(() => {
    if (!textId) return undefined;
    return db.texts.get(Number(textId));
  }, [textId]);

  useEffect(() => {
    const validateAudioUrl = async () => {
      if (text?.audioUrl && text.audioUrl.startsWith('blob:')) {
        try {
          await fetch(text.audioUrl);
        } catch {
          // Blob URL is invalid, so we clear it from the DB
          console.warn('Stale audioUrl detected and removed.');
          await db.texts.update(text.id!, { audioUrl: '' });
        }
      }
    };

    validateAudioUrl();
  }, [text]);

  if (!text) {
    return <div>Loading text... or text not found.</div>;
  }

  // Process the text to make each word interactive
  const wordsAndSpaces = text.content.split(/(\s+)/);

  const handleAudioFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && text?.id) {
      const audioUrl = URL.createObjectURL(file);
      await db.texts.update(text.id, { audioUrl });
    }
  };

  return (
    <div>
      <Link to="/">Back to Library</Link>
      <h1>{text.title}</h1>
      {text.audioUrl && <AudioPlayer audioUrl={text.audioUrl} />}
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

