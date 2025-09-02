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
      <head>
        <script
          async
          defer
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places&loading=async`}
        />
        {process.env.NODE_ENV === 'development' && (
          <script 
            dangerouslySetInnerHTML={{
              __html: `
                // Early warning suppression for Swagger UI
                (function() {
                  if (typeof window !== 'undefined') {
                    const originalWarn = console.warn;
                    const originalError = console.error;
                    
                    const shouldSuppress = (message) => {
                      if (typeof message === 'string') {
                        return (
                          message.includes('Using UNSAFE_componentWillReceiveProps') ||
                          message.includes('UNSAFE_componentWillReceiveProps') ||
                          message.includes('componentWillReceiveProps') ||
                          message.includes('ModelCollapse') ||
                          message.includes('OperationContainer') ||
                          message.includes('ContentType') ||
                          message.includes('ExamplesSelect') ||
                          message.includes('ParameterRow') ||
                          message.includes('Move data fetching code or side effects') ||
                          message.includes('refactor your code to use memoization') ||
                          message.includes('https://react.dev/link/unsafe-component-lifecycles') ||
                          message.includes('https://react.dev/link/derived-state') ||
                          message.includes('Please update the following components:')
                        );
                      }
                      return false;
                    };
                    
                    console.warn = function(...args) {
                      if (!shouldSuppress(args[0])) {
                        originalWarn.apply(console, args);
                      }
                    };
                    
                    console.error = function(...args) {
                      if (!shouldSuppress(args[0])) {
                        originalError.apply(console, args);
                      }
                    };
                  }
                })();
              `
            }}
          />
        )}
      </head>
      <body>
        <Providers>
          <NextTopLoader color="#5750F1" showSpinner={false} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
