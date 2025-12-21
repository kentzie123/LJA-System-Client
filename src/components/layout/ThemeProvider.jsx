"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";

export function ThemeProvider({children}) {
  return (
    <NextThemeProvider
      enableSystem
      defaultTheme="system"
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}
