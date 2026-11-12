/** Decorative module covers, never a generated reading or a user's result. */
export function PortalArtwork({ id, eager }: { id: string; eager: boolean }) {
  if (id === 'tarot') return <svg viewBox="0 0 360 320" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="tarot-cover-halo"><stop stopColor="#9f4761" stopOpacity=".65" /><stop offset="1" stopColor="#431325" stopOpacity="0" /></radialGradient>
      <linearGradient id="tarot-cover-face" x1="110" y1="50" x2="245" y2="280" gradientUnits="userSpaceOnUse"><stop stopColor="#48223a" /><stop offset=".5" stopColor="#151124" /><stop offset="1" stopColor="#491e33" /></linearGradient>
      <linearGradient id="tarot-cover-gold"><stop stopColor="#796044" /><stop offset=".48" stopColor="#f2d4a0" /><stop offset="1" stopColor="#9e7549" /></linearGradient>
    </defs>
    <ellipse cx="180" cy="173" rx="160" ry="145" fill="url(#tarot-cover-halo)" />
    <g transform="rotate(-17 150 170)" stroke="url(#tarot-cover-gold)" strokeWidth=".85"><rect x="83" y="66" width="119" height="202" rx="8" fill="#211529" /><rect x="89" y="72" width="107" height="190" rx="4" /><path d="M100 83h85v168h-85Z" strokeOpacity=".3" /></g>
    <g transform="rotate(10 208 164)"><rect x="145" y="48" width="126" height="216" rx="7" fill="url(#tarot-cover-face)" stroke="url(#tarot-cover-gold)" strokeWidth="1.3" /><rect x="151" y="54" width="114" height="204" rx="4" stroke="#dab884" strokeWidth=".6" /><path d="M157 82V61h21m66 0h15v21m0 148v21h-21m-60 0h-21v-21" stroke="#dcc291" strokeWidth="1.1" /><circle cx="208" cy="156" r="42" stroke="#a88462" strokeWidth=".8" /><circle cx="208" cy="156" r="33" stroke="#ddb783" strokeWidth=".45" /><path d="m208 107 13 35 37 14-37 13-13 36-13-36-37-13 37-14 13-35Z" stroke="#e0bc86" strokeWidth=".8" /><path d="m208 134 7 15 16 7-16 7-7 15-7-15-16-7 16-7 7-15Z" fill="#c39a6c" fillOpacity=".45" /><path d="M208 77v15m-5-7h10m-5 134v15m-5-7h10" stroke="#d5af79" strokeWidth=".8" /><circle cx="167" cy="105" r="1.5" fill="#d7b980" /><circle cx="249" cy="209" r="1.5" fill="#d7b980" /></g>
    <path d="m63 100 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Zm222 118 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" fill="#e4c393" fillOpacity=".75" />
  </svg>;
  if (id === 'numerology') return <svg viewBox="0 0 360 320" fill="none" aria-hidden="true">
    <defs><radialGradient id="number-cover-halo"><stop stopColor="#9159bd" stopOpacity=".5" /><stop offset="1" stopColor="#32164b" stopOpacity="0" /></radialGradient><linearGradient id="number-cover-gold" x1="130" y1="75" x2="220" y2="240" gradientUnits="userSpaceOnUse"><stop stopColor="#fff0cb" /><stop offset=".5" stopColor="#ba8c5f" /><stop offset="1" stopColor="#eed8a6" /></linearGradient></defs>
    <circle cx="180" cy="161" r="145" fill="url(#number-cover-halo)" /><g stroke="#b59571" strokeWidth=".6"><circle cx="180" cy="160" r="105" /><circle cx="180" cy="160" r="89" /><circle cx="180" cy="160" r="65" strokeOpacity=".45" /><ellipse cx="180" cy="160" rx="122" ry="67" transform="rotate(-27 180 160)" /><path d="m180 45 100 172H80L180 45Zm0 230L80 103h200L180 275Z" strokeOpacity=".4" />{Array.from({length:12},(_,i)=><g key={i} transform={`rotate(${i*30} 180 160)`}><path d="M180 52v12" /><circle cx="180" cy="72" r="1.6" fill="#e4c392" /></g>)}</g>
    <text x="180" y="195" textAnchor="middle" fill="url(#number-cover-gold)" fontFamily="var(--font-display),Georgia,serif" fontSize="125" fontWeight="400">4</text><path d="m268 74 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" fill="#e3c194" />
  </svg>;
  return <img src={`/images/portals/${id}.webp`} alt="" width="640" height="640" loading={eager ? 'eager' : 'lazy'} />;
}
