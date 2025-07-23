import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { db } from '../db/db';
import styles from './ReviewPage.module.css';

const ReviewPage: React.FC = () => {
  const unknownWords = useLiveQuery(() => 
    db.words.where('status').equals('unknown').toArray()
  , []);

  // Función para eliminar una palabra
  const handleDeleteWord = async (lemma: string) => {
    try {
      // 'lemma' es la clave primaria, así que podemos usar delete
      await db.words.delete(lemma);
    } catch (error) {
      console.error("Failed to delete word:", error);
    }
  };

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
              <button 
                onClick={() => handleDeleteWord(word.lemma)} 
                className={styles.deleteButton}
              >
                Delete
              </button>
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
