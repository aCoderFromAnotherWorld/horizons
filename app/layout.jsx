import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Horizons",
  description: "ASD screening game for children",
};

export default function RootLayout({ children }) {
  const themeScript = `
    (() => {
      try {
        const saved = localStorage.getItem("horizons-theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const theme = saved || "system";
        const resolved = theme === "system" ? (prefersDark ? "dark" : "light") : theme;
        document.documentElement.dataset.theme = resolved;
        document.documentElement.style.colorScheme = resolved;
      } catch {
        document.documentElement.dataset.theme = "light";
      }
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
