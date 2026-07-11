import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { storage } from './services/storage';
import Navigation from './components/Navigation';
import Tutorial from './pages/Tutorial';
import Home from './pages/Home';
import Question from './pages/Question';
import Feedback from './pages/Feedback';
import Lateral from './pages/Lateral';
import Tracker from './pages/Tracker';
import Settings from './pages/Settings';

export default function App() {
  const [tutorialDone, setTutorialDone] = useState(storage.isTutorialDone());

  function handleTutorialFinish() {
    setTutorialDone(true);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/tutorial"
          element={<Tutorial onFinish={handleTutorialFinish} />}
        />
        <Route
          path="/*"
          element={
            !tutorialDone ? (
              <Navigate to="/tutorial" replace />
            ) : (
              <>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/question" element={<Question />} />
                  <Route path="/feedback" element={<Feedback />} />
                  <Route path="/lateral" element={<Lateral />} />
                  <Route path="/tracker" element={<Tracker />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
                <Navigation />
              </>
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
