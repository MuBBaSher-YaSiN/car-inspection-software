'use client';

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/redux/store";
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <ReduxProvider store={store}>
            {children}
          </ReduxProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
