import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { db } from '../db/db';

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
    <div>
      <h1>Lumi Text</h1>
      <Link to="/add-text">
        <button>Add New Text</button>
      </Link>
      <Link to="/review">
        <button style={{ marginLeft: '10px' }}>Review Words</button>
      </Link>
      <h2>My Library</h2>
      <ul>
        {texts?.map(text => (
          <li key={text.id}>
            <Link to={`/reader/${text.id}`}>{text.title}</Link>
            <button onClick={() => handleDelete(text.id!)} style={{ marginLeft: '10px' }}>Delete</button>
          </li>
        ))}
      </ul>
      {texts?.length === 0 && <p>Your library is empty. Add a new text to get started!</p>}
    </div>
  );
};

export default HomePage;

