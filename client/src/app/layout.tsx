import { Montserrat } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${montserrat.className}
          antialiased flex flex-col min-h-screen text-foreground relative
          transition-colors duration-300
        `}
        style={{ backgroundColor: 'var(--background)' }}
      >
        <div
          className="fixed inset-0 -z-10 pointer-events-none w-full"
          aria-hidden="true"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 30%, var(--color-primary-1), var(--background))`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
