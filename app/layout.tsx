import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'PACT Protocol — machine-evaluable commitments',
  description: 'The open protocol for machine-evaluable commitments: sealed terms, hash-committed evidence, resolver-agnostic settlement.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-[1000px] w-full mx-auto px-6 py-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
