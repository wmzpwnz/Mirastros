import { redirect } from 'next/navigation';

// Keep links from the original dashboard working while maintaining one
// canonical calculation and result experience.
export default function LegacyNatalChartRoute() {
  redirect('/services/natal');
}
