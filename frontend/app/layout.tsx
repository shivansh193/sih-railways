import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans'; // Import Geist Sans
import './globals.css';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Rail-Forecast Dashboard',
  description: 'AI-Powered Railway Network Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}> {/* Use Geist Sans */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <Sidebar />
            <div className="flex flex-col">
              <Header />
              <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto bg-muted/20">
                {children}
              </main>
            </div>
          </div>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}