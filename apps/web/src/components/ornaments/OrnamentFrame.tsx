import styles from './OrnamentFrame.module.css';

/** Fine line filigree shared by the landing, portal cards and account chrome. */
export function OrnamentFrame({ className = '' }: { className?: string }) {
  return <span className={`${styles.frame} ${className}`} aria-hidden="true">
    {[0, 1, 2, 3].map(i => <svg key={i} className={styles.corner} viewBox="0 0 100 100" fill="none">
      <path d="M3 97V17C3 8 8 3 17 3h80M8 86V20C8 12 12 8 20 8h66M14 64V24c0-6 4-10 10-10h40" />
      <path d="M5 5c22-2 40 8 34 24-5 12-23 12-27 0-3-9 8-16 14-9 4 5-1 10-5 6M5 5c-2 22 8 40 24 34 12-5 12-23 0-27-9-3-16 8-9 14 5 4 10-1 6-5" />
      <path d="M14 14c13 16 29 26 46 24 12-2 14-16 5-19-7-2-12 5-7 10M14 14c16 13 26 29 24 46-2 12-16 14-19 5-2-7 5-12 10-7M38 38c15 2 23 11 25 25-14-2-23-10-25-25Z" />
      <path d="M5 78c5-19 20-15 16-6-3 6-11 5-13 14M78 5c-19 5-15 20-6 16 6-3 5-11 14-13M46 12l4 5-4 5-4-5 4-5ZM12 46l5 4 5-4-5-4-5 4Z" />
      <path d="M14 54c8-8 15-7 17 0-6 2-12 0-17-6M54 14c-8 8-7 15 0 17 2-6 0-12-6-17M63 8c5 7 10 9 16 7-3-6-9-8-16-7M8 63c7 5 9 10 7 16-6-3-8-9-7-16" />
      <circle cx="14" cy="14" r="2" /><circle cx="49" cy="49" r="2" />
    </svg>)}
    <svg className={styles.crest} viewBox="0 0 150 20" fill="none"><path d="M0 10h40l10-5 12 5 13-8 13 8 12-5 10 5h40M50 10l12 5 13-8 13 8 12-5M72 10l3-3 3 3-3 3-3-3Z" /></svg>
  </span>;
}

export function MirastrosSeal({ className = '' }: { className?: string }) {
  return <svg className={`${styles.seal} ${className}`} viewBox="0 0 180 180" fill="none" aria-hidden="true">
    <circle cx="90" cy="90" r="74" /><circle cx="90" cy="90" r="65" /><circle cx="90" cy="90" r="46" />
    <path d="m90 5 22 48 53 37-53 22-22 63-22-63L5 90l63-37L90 5Zm0 32 46 79H44l46-79Zm0 106L44 64h92l-46 79Z" />
    {Array.from({ length: 12 }, (_, i) => <g key={i} transform={`rotate(${i * 30} 90 90)`}><path d="M90 12v11" /><circle cx="90" cy="28" r="1" /></g>)}
    <path d="m90 66 20 12v25l-20 12-20-12V78l20-12Z" fill="#171025" />
    <text x="90" y="101" textAnchor="middle">M</text>
  </svg>;
}
