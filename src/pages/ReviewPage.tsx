import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { db } from '../db/db';
import styles from './ReviewPage.module.css';

const ReviewPage: React.FC = () => {
  const unknownWords = useLiveQuery(() => 
    db.words.where('status').equals('unknown').toArray()
  , []);

  // Handle loading state while the query is running
  if (!unknownWords) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <Link to="/">← Back to Library</Link>
          <h1>Review Unknown Words</h1>
        </div>
        <div className={styles.emptyMessage}>
          <p>Loading review list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <Link to="/">← Back to Library</Link>
        <h1>Review Unknown Words</h1>
      </div>
      {unknownWords.length > 0 ? (
        <div className={styles.wordList}>
          {unknownWords.map((word) => (
            <div key={word.lemma} className={styles.wordItem}>
              <span className={styles.wordLemma}>{word.lemma}</span>
              <span className={styles.wordTranslation}>{word.translation}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyMessage}>
          <p>You haven't marked any words as unknown yet. Start reading to build your review list!</p>
        </div>
      )}
    </div>
  );
};

export default ReviewPage;
