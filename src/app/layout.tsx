import "./globals.css";
import "@/lib/amplify"; // Import Amplify configuration
import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    template: "%s | Energy Insight",
    default: "Energy Insight",
  },
  description:
    "Energy Insight is a platform that helps you calculate the energy consumption of your home.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Providers>
          <NextTopLoader color="#5750F1" showSpinner={false} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
