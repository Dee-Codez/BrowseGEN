import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import BrowserPage from './pages/BrowserPage';
import './index.css';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/browser" element={<BrowserPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
