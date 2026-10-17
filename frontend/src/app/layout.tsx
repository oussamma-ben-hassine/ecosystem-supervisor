import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export const metadata: Metadata = {
  title: 'Ecosystem Supervisor — oussamma.tn',
  description: 'Centralized telemetry, activity 360, AI monitoring and security alerts for oussamma.tn',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-[#090d16] text-slate-100 min-h-screen flex antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
