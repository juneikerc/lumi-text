import React from 'react';
import styles from './ResourceCard.module.css';

const ResourceCard: React.FC = () => {
  return (
    <div className={styles.card}>
      <div className={styles.icon}>📚</div>
      <div className={styles.content}>
        <h3 className={styles.title}>¿Buscas textos para leer?</h3>
        <p className={styles.description}>
          Encuentra libros gratis en formato `.txt` con audio, filtrados por nivel (A1, A2, B1, etc.), en{' '}
          <a href="https://english-e-reader.net/" target="_blank" rel="noopener noreferrer">
            english-e-reader.net
          </a>. Es el recurso perfecto para construir tu biblioteca.
        </p>
      </div>
    </div>
  );
};

export default ResourceCard;
