import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/db';
import styles from './AddTextPage.module.css';

const AddTextPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [textFile, setTextFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTextFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setContent(text);
        if (!title) {
          setTitle(file.name.replace(/\.txt$/, ''));
        }
      };
      reader.readAsText(file);
    }
  };

  const handleAudioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Please provide a title and content.');
      return;
    }

    try {
      const id = await db.texts.add({
        title,
        content,
        createdAt: new Date(),
        audioData: audioFile || undefined,
      });
      navigate(`/reader/${id}`); // Navigate to the new text's reader page
    } catch (error) {
      console.error('Failed to add text:', error);
      alert('Failed to save the text. Please try again.');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1>Add New Text</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor='title'>Title</label>
          <input type="text" id='title' value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor='content'>Content</label>
          <textarea id='content' value={content} onChange={(e) => setContent(e.target.value)} required />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor='file' className={styles.fileInputWrapper}>
            <span className={styles.fileInputLabel}>Click to upload a .txt file</span>
            <input type="file" id='file' accept=".txt" onChange={handleFileChange} />
            {textFile && <p className={styles.fileName}>{textFile.name}</p>}
          </label>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor='audio' className={styles.fileInputWrapper}>
            <span className={styles.fileInputLabel}>Click to associate an audio file</span>
            <input type="file" id='audio' accept="audio/*" onChange={handleAudioChange} />
            {audioFile && <p className={styles.fileName}>{audioFile.name}</p>}
          </label>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelButton} onClick={() => navigate('/')}>Cancel</button>
          <button type="submit">Add Text</button>
        </div>
      </form>
    </div>
  );
};

export default AddTextPage;
