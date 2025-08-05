'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps as NextThemesProviderProps } from 'next-themes';

interface ThemeProviderProps extends NextThemesProviderProps {}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
