// SplashScreen.jsx
// Écran de démarrage Mister 2X.
// Affiché pendant ~2.5s au lancement, puis fondu enchaîné vers l'app.

import { useEffect, useState } from 'react';
import Mister2XAvatar from './Mister2XAvatar';

export default function SplashScreen({ onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // L'animation CSS dure 2.2s + 0.5s de fade-out.
    const timer = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 2750);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div className="splash">
      <div className="splash-logo">
        <Mister2XAvatar size={110} glowing />
      </div>

      <div className="splash-name">
        MISTER <span>2X</span>
      </div>

      <div className="splash-tagline">by Coutchcatcreat</div>

      <div className="splash-bar-wrap">
        <div className="splash-bar" />
      </div>
    </div>
  );
}
