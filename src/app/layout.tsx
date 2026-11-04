import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Janmabhoomi | સમાચાર • વિશ્વાસ • નિષ્પક્ષતા",
    template: "%s | Janmabhoomi",
  },
  description:
    "Official digital newspaper website of Janmabhoomi (Saurashtra Trust). Trusted news, National, City, Business, Sports, Entertainment, Editorial (અગ્રલેખ), and E-Paper.",
  openGraph: {
    type: "website",
    siteName: "Janmabhoomi Digital Newspaper",
    title: "Janmabhoomi | સમાચાર • વિશ્વાસ • નિષ્પક્ષતા",
    description:
      "Credible journalism since 1934. Read daily news previews and subscribe to the complete Janmabhoomi E-Paper.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Gujarati:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FAF8F3] text-[#292725] antialiased">
        {children}
      </body>
    </html>
  );
}
