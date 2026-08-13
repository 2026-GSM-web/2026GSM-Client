import './globals.css';
import Header from '@/components/Header';
import Providers from './provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-white text-black dark:bg-zinc-900">
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}