import React from 'react';

/** Shared browser ornaments drawn from the approved gold/violet board.
 * SVG artwork stays separate from animation and platform navigation. */
export function OrnamentFrame({ className = '' }: { className?: string }) {
  return <span className={`mira-ornament ${className}`} aria-hidden="true">
    {[0, 1, 2, 3].map(i => <svg key={i} className="mira-ornament-corner" viewBox="0 0 100 100" fill="none">
      <path d="M2 98V16C2 7 7 2 16 2h82M7 85V19C7 11 11 7 19 7h66M12 68V24c0-7 5-12 12-12h44" />
      <path d="M4 4c20-2 37 7 32 23-4 12-21 13-25 2-4-10 7-17 13-10 4 5-1 10-6 6M4 4C2 24 11 41 27 36c12-4 13-21 2-25-10-4-17 7-10 13 5 4 10-1 6-6" />
      <path d="M14 14c14 19 30 27 45 23 11-3 12-16 3-18-7-2-11 5-6 10M14 14c19 14 27 30 23 45-3 11-16 12-18 3-2-7 5-11 10-6M36 36c13 2 24 12 26 26-14-2-24-13-26-26Z" />
      <path d="M8 73c7-20 22-15 16-7-4 6-10 3-13 15M73 8c-20 7-15 22-7 16 6-4 3-10 15-13M44 11l4 5-4 5-4-5 4-5ZM11 44l5 4 5-4-5-4-5 4Z" />
      <path d="M52 14c-10 7-12 16-5 19 4-6 4-12-1-16M14 52c7-10 16-12 19-5-6 4-12 4-16-1M63 7c4 7 10 10 17 7-4-6-10-8-17-7M7 63c7 4 10 10 7 17-6-4-8-10-7-17" />
      <circle cx="12" cy="12" r="1.8" /><circle cx="47" cy="47" r="1.6" />
    </svg>)}
    <svg className="mira-ornament-crest" viewBox="0 0 150 20" fill="none"><path d="M0 10h38l11-4 13 4 13-8 13 8 13-4 11 4h38M49 10l13 5 13-8 13 8 13-5M71 10l4-3 4 3-4 3-4-3Z" /></svg>
  </span>;
}

export function MirastrosSeal({ className = '' }: { className?: string }) {
  return <svg className={`mira-seal ${className}`} viewBox="0 0 180 180" fill="none" aria-hidden="true">
    <circle cx="90" cy="90" r="70" /><circle cx="90" cy="90" r="62" /><circle cx="90" cy="90" r="51" /><circle cx="90" cy="90" r="35" />
    {Array.from({ length: 24 }, (_, i) => <g key={i} transform={`rotate(${i * 15} 90 90)`}>
      <path d={i % 3 === 0 ? 'M90 5l3 14-3 6-3-6 3-14ZM90 25v12' : 'M90 14v10M90 28v6'} />
      {i % 2 === 0 && <path d="M90 39v7m-3-3 3-4 3 4" />}
    </g>)}
    <path d="m90 32 41 80H49l41-80Zm0 116L49 68h82l-41 80Z" opacity=".35" />
    <path d="M50 90h5m70 0h5M90 50v5m0 70v5" />
    <text x="90" y="105" textAnchor="middle">M</text>
  </svg>;
}
