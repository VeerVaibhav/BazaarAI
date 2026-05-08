import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "BazaarAI | Your shop online in 30 seconds",
  description: "The fastest way to list your shop online with AI-powered scanning and listing.",
};

// Inline script to set dark class before React hydrates (prevents flash + hydration mismatch)
const darkModeScript = `(function(){try{if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: darkModeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased overflow-x-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
