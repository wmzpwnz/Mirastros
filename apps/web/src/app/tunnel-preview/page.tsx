import type { Metadata } from 'next';
import { DepthJourney } from '../../components/journey/DepthJourney';

export const metadata: Metadata = {
  title: 'Mirastros — полёт по направлениям',
  robots: { index: false, follow: false },
};

export default function TunnelPreviewPage() {
  return <DepthJourney />;
}
