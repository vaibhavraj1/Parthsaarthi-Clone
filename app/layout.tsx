import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { DemoControls } from '@/components/DemoControls';

export const metadata: Metadata = {
  title: 'Parthsaarthi — Scheduled Slot Release | IIM Lucknow',
  description:
    'Automated Scheduled Slot Release feature enhancement for the Parthsaarthi Mentoring & SIP Portal.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <DemoControls />
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 space-y-1">
            <p className="font-semibold text-slate-700">
              Parthsaarthi — Mentoring & SIP Scheduled Slot Release MVP
            </p>
            <p>
              Designed for IIM Lucknow Junior & Senior Batch Coordination • Authoritative Timezone: Asia/Kolkata (IST)
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
