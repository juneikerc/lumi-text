import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { db } from '../db/db';

const ReviewPage: React.FC = () => {
  const unknownWords = useLiveQuery(() => 
    db.words.where('status').equals('unknown').toArray()
  , []);

  return (
    <div>
      <Link to="/">Back to Library</Link>
      <h1>Review Unknown Words</h1>
      {unknownWords && unknownWords.length > 0 ? (
        <ul>
          {unknownWords.map(word => (
            <li key={word.lemma}>
              <strong>{word.lemma}</strong>: {word.translation}
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven't marked any words as unknown yet. Start reading to build your review list!</p>
      )}
    </div>
  );
};

export default ReviewPage;
