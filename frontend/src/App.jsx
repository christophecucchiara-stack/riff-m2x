// App.jsx
import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Feed from './pages/Feed';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import SplashScreen from './components/SplashScreen';

export default function App() {
  const location = useLocation();
  const [splashDone, setSplashDone] = useState(false);
  const hideNav = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="app-shell">
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}

      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />
        <Route path="/profile/:username" element={<Profile />} />
      </Routes>

      {!hideNav && <BottomNav />}
    </div>
  );
}
