import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AddTextPage from './pages/AddTextPage';
import ReaderPage from './pages/ReaderPage';
import ReviewPage from './pages/ReviewPage';
import { WordProvider } from './context/WordContext';
import './App.css';

function App() {
  return (
    <WordProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/add-text" element={<AddTextPage />} />
          <Route path="/reader/:textId" element={<ReaderPage />} />
          <Route path="/review" element={<ReviewPage />} />
        </Routes>
      </Router>
    </WordProvider>
  );
}

export default App;

