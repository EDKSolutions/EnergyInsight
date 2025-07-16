"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import { AmplifyProvider } from "@/components/auth/AmplifyProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <AmplifyProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </AmplifyProvider>
    </ThemeProvider>
  );
}
