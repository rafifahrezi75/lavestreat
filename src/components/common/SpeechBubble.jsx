import React from 'react';

export function SpeechBubble({
  children,
  variant = 'white',
  className = ''
}) {
  const isWhite = variant === 'white';

  return (
    <div
      className={`speech-bubble ${
        isWhite
          ? 'speech-bubble-white bg-white text-ink-deep border border-brand-200'
          : 'speech-bubble-navy bg-brand-900 text-snow-foam'
      } p-6 shadow-subtle ${className}`}
    >
      {children}
    </div>
  );
}
