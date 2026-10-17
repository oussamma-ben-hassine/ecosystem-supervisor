import type { Metadata, Viewport } from 'next';
import './globals.css';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { ThemeProvider } from '../components/ThemeProvider';
import { MobileMenuProvider } from '../components/MobileMenuContext';

export const metadata: Metadata = {
  title: 'Ecosystem Supervisor — oussamma.tn',
  description: 'Supervision centralisée, télémétrie multi-applications, consommation IA et alertes pour oussamma.tn',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
      </head>
      <body className="bg-slate-50 dark:bg-[#080808] text-slate-900 dark:text-white min-h-screen flex antialiased">
        <ThemeProvider>
          <MobileMenuProvider>
            {/* Desktop and Mobile Responsive Sidebar */}
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 min-h-screen">
              <Navbar />
              <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
                {children}
              </main>
            </div>
          </MobileMenuProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
