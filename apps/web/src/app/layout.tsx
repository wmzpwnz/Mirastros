import './global.css';
import { Navbar } from '../components/Navbar';
import { Background3D } from '../components/Background3D';
import { Cinzel, Inter } from 'next/font/google';

// Configure fonts
const cinzel = Cinzel({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-cinzel',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Mirastros - Мистический Проводник',
  description: 'Астрология, Таро, Нумерология и другие эзотерические практики с AI',
  keywords: ['астрология', 'таро', 'нумерология', 'гороскоп', 'натальная карта'],
  authors: [{ name: 'Mirastros' }],
  openGraph: {
    title: 'Mirastros - Мистический Проводник',
    description: 'Астрология, Таро, Нумерология и другие эзотерические практики с AI',
    type: 'website',
    locale: 'ru_RU',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${cinzel.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <Background3D />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
