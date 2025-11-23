import type { Metadata } from 'next';
import './global.css';

export const metadata: Metadata = {
  title: 'Mirastros Admin',
  description: 'Admin panel for Mirastros Universal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-cosmic text-silver antialiased">
        {children}
      </body>
    </html>
  );
}
