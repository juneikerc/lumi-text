import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/db';

const AddTextPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
      let audioUrl: string | undefined = undefined;
      if (audioFile) {
        audioUrl = URL.createObjectURL(audioFile);
      }

      const id = await db.texts.add({
        title,
        content,
        createdAt: new Date(),
        audioUrl,
      });
      navigate(`/reader/${id}`); // Navigate to the new text's reader page
    } catch (error) {
      console.error('Failed to add text:', error);
      alert('Failed to save the text. Please try again.');
    }
  };

  return (
    <div>
      <h1>Add New Text</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            cols={80}
            required
          />
        </div>
        <div>
            <label htmlFor='file'>Or upload a .txt file</label>
            <input type="file" id='file' accept=".txt" onChange={handleFileChange} />
        </div>
        <div>
            <label htmlFor='audio'>Associate an audio file</label>
            <input type="file" id='audio' accept="audio/*" onChange={handleAudioChange} />
        </div>
        <button type="submit">Add Text</button>
      </form>
      <button onClick={() => navigate('/')}>Cancel</button>
    </div>
  );
};

export default AddTextPage;

