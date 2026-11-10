'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { config } from '../config';
import { LANDING_TUNNEL_MEDIA } from '../constants/tunnelMedia';
import { createLandingAnimations } from './tunnel/landingAnimations';
import { useZScrollTunnel } from '../hooks/useZScrollTunnel';

import { HeroSection } from '../components/sections/HeroSection';

// Critical components load first
import { Background3D } from '../components/Background3D';
import { DynamicBackground } from '../components/DynamicBackground';

// Dynamic imports for all sections to prevent heavy initial load
const TarotSection = dynamic(() => import('../components/sections/TarotSection').then(m => m.TarotSection), { ssr: false });
const AstrologySection = dynamic(() => import('../components/sections/AstrologySection').then(m => m.AstrologySection), { ssr: false });
const HoroscopeSection = dynamic(() => import('../components/sections/HoroscopeSection').then(m => m.HoroscopeSection), { ssr: false });
const NatalSection = dynamic(() => import('../components/sections/NatalSection').then(m => m.NatalSection), { ssr: false });
const RunesSection = dynamic(() => import('../components/sections/RunesSection').then(m => m.RunesSection), { ssr: false });
const NumerologySection = dynamic(() => import('../components/sections/NumerologySection').then(m => m.NumerologySection), { ssr: false });
const DreamSection = dynamic(() => import('../components/sections/DreamSection').then(m => m.DreamSection), { ssr: false });
const IChingSection = dynamic(() => import('../components/sections/IChingSection').then(m => m.IChingSection), { ssr: false });
const LenormandSection = dynamic(() => import('../components/sections/LenormandSection').then(m => m.LenormandSection), { ssr: false });
const ChakraSection = dynamic(() => import('../components/sections/ChakraSection').then(m => m.ChakraSection), { ssr: false });
const TransitsSection = dynamic(() => import('../components/sections/TransitsSection').then(m => m.TransitsSection), { ssr: false });
const SynastrySection = dynamic(() => import('../components/sections/SynastrySection').then(m => m.SynastrySection), { ssr: false });
const LunarSection = dynamic(() => import('../components/sections/LunarSection').then(m => m.LunarSection), { ssr: false });
const CrystalsSection = dynamic(() => import('../components/sections/CrystalsSection').then(m => m.CrystalsSection), { ssr: false });
const RitualsSection = dynamic(() => import('../components/sections/RitualsSection').then(m => m.RitualsSection), { ssr: false });
const HorarySection = dynamic(() => import('../components/sections/HorarySection').then(m => m.HorarySection), { ssr: false });
const SolarReturnSection = dynamic(() => import('../components/sections/SolarReturnSection').then(m => m.SolarReturnSection), { ssr: false });
const KarmicSection = dynamic(() => import('../components/sections/KarmicSection').then(m => m.KarmicSection), { ssr: false });
const MandalaSection = dynamic(() => import('../components/sections/MandalaSection').then(m => m.MandalaSection), { ssr: false });
const ShopSection = dynamic(() => import('../components/sections/ShopSection').then(m => m.ShopSection), { ssr: false });

export default function Home() {
  const tunnelInit = useMemo(
    () => createLandingAnimations({ mediaTrack: LANDING_TUNNEL_MEDIA }),
    []
  );

  useZScrollTunnel({
    enabled: config.features.enableZScroll,
    enableMobile: config.features.enableLandingZScrollMobile,
    desktopMinWidth: config.features.zScrollDesktopMinWidth,
    expectedFirstSlideId: 'hero',
    expectedLastSlideId: 'shop',
    overlap: 1.82,
    onInit: tunnelInit,
  });

  return (
    <>
      <Background3D />

      <DynamicBackground sources={LANDING_TUNNEL_MEDIA} blurAmount={100} scale={1.2} />

      <main className="viewport">
        <HeroSection id="hero" />
        <TarotSection id="tarot" />
        <AstrologySection id="astrology" />
        <HoroscopeSection id="horoscope" />
        <NatalSection id="natal" />
        <RunesSection id="runes" />
        <NumerologySection id="numerology" />
        <DreamSection id="dream" />
        <IChingSection id="iching" />
        <LenormandSection id="lenormand" />
        <ChakraSection id="chakra" />
        <TransitsSection id="transits" />
        <SynastrySection id="synastry" />
        <LunarSection id="lunar" />
        <CrystalsSection id="crystals" />
        <RitualsSection id="rituals" />
        <HorarySection id="horary" />
        <SolarReturnSection id="solar-return" />
        <KarmicSection id="karmic" />
        <MandalaSection id="mandala" />
        <ShopSection id="shop" />
      </main>

      <div className="scroll-indicator-bottom landing-scroll-indicator">
        <span>SCROLL</span>
        <span className="scroll-percent text-shine" id="scrollPercent">
          0%
        </span>
      </div>
    </>
  );
}
