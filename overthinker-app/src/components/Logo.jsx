import React from 'react';

export default function Logo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="4.6" r="2.7" fill="#FFF8E7"></circle>
      <circle cx="4.8" cy="13.4" r="2.2" fill="#B7F34A"></circle>
      <circle cx="19.2" cy="13.4" r="2.2" fill="#FF4FA3"></circle>
      <circle cx="12" cy="20.6" r="2.1" fill="#4CC9F0"></circle>
      <path d="M12 7.3v3M12 10.3H4.8v.9M12 10.3h7.2v.9M4.8 15.6l4.9 3.6M19.2 15.6l-4.9 3.6" stroke="#FFF8E7" strokeWidth="1.5" strokeLinecap="round"></path>
    </svg>
  );
}
