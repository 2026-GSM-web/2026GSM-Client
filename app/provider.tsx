'use client';

import { ThemeProvider } from 'next-themes';
import { ClientOAuthProvider } from './oauth-wrapper';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ClientOAuthProvider>{children}</ClientOAuthProvider>
    </ThemeProvider>
  );
}