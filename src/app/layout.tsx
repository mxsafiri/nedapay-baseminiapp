import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { OffersProvider } from '@/contexts/OffersContext';
import { MiniKitContextProvider } from '@/components/providers/MiniKitProvider';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NEDApay Base MiniKit',
  description: 'Stablecoin payments and DeFi on Base',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <OffersProvider>
            <MiniKitContextProvider>
              {children}
            </MiniKitContextProvider>
          </OffersProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
