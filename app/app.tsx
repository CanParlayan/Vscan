import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './login/page';
import HomePage from './page';
import ScanPage from './scan/page';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/scan" element={<ScanPage />} />
      </Routes>
    </Router>
  );
};

export default App;
