import React from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import styles from './HomePage.module.css';

const HomePage: React.FC = () => {
  const texts = useLiveQuery(() => db.texts.toArray());

  const handleDelete = async (textId: number) => {
    if (window.confirm('Are you sure you want to delete this text?')) {
      try {
        await db.texts.delete(textId);
      } catch (error) {
        console.error('Failed to delete text:', error);
        alert('Failed to delete the text.');
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>Lumi Text</h1>
        <div className={styles.actions}>
          <Link to="/add-text">
            <button>Add New Text</button>
          </Link>
          <Link to="/review">
            <button>Review Words</button>
          </Link>
        </div>
      </header>
      
      <h2>My Library</h2>
      
      {texts && texts.length > 0 ? (
        <ul className={styles.textList}>
          {texts.map(text => (
            <li key={text.id} className={styles.textItem}>
              <Link to={`/reader/${text.id}`} className={styles.textTitle}>{text.title}</Link>
              <div className={styles.textActions}>
                <button onClick={() => handleDelete(text.id!)} className={styles.deleteButton}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.emptyMessage}>
          <p>Your library is empty. Add a new text to get started!</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
