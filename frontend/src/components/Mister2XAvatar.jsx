// Mister2XAvatar.jsx
// Silhouette de Mister 2X : capuche noire, yeux en X dorés lumineux.
// Utilisé partout à la place des initiales/avatars classiques.
// Props : size (px), glowing (bool — active la lueur or), className

export default function Mister2XAvatar({ size = 40, glowing = false, className = '' }) {
  const id = `glow-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <filter id={id} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Fond circulaire sombre */}
      <circle cx="50" cy="50" r="50" fill="#0f0f12" />

      {/* Corps + capuche — silhouette simple */}
      {/* Capuche extérieure */}
      <ellipse cx="50" cy="38" rx="26" ry="28" fill="#1a1a1f" />
      {/* Visage (zone plus claire à l'intérieur de la capuche) */}
      <ellipse cx="50" cy="42" rx="17" ry="18" fill="#141418" />
      {/* Épaules / corps */}
      <path d="M18 100 Q20 68 50 64 Q80 68 82 100 Z" fill="#1a1a1f" />
      {/* Ombre intérieure capuche (profondeur) */}
      <ellipse cx="50" cy="34" rx="14" ry="8" fill="#0d0d10" opacity="0.6" />

      {/* Yeux X dorés */}
      {/* Œil gauche */}
      <g transform="translate(34, 40)" filter={glowing ? `url(#${id})` : undefined}>
        <line x1="-6" y1="-6" x2="6" y2="6" stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="6" y1="-6" x2="-6" y2="6" stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round" />
      </g>

      {/* Œil droit */}
      <g transform="translate(66, 40)" filter={glowing ? `url(#${id})` : undefined}>
        <line x1="-6" y1="-6" x2="6" y2="6" stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="6" y1="-6" x2="-6" y2="6" stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round" />
      </g>

      {/* Lueur subtile autour des yeux quand actif */}
      {glowing && (
        <>
          <circle cx="34" cy="40" r="10" fill="#FFD700" opacity="0.08" />
          <circle cx="66" cy="40" r="10" fill="#FFD700" opacity="0.08" />
        </>
      )}
    </svg>
  );
}
