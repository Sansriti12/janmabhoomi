import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.janmabhoomi.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Janmabhoomi | સમાચાર • વિશ્વાસ • નિષ્પક્ષતા",
    template: "%s | Janmabhoomi",
  },
  description:
    "Official digital newspaper website of Janmabhoomi (Saurashtra Trust). Trusted news, National, City, Business, Sports, Entertainment, Editorial (અગ્રલેખ), and E-Paper.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "./",
    languages: {
      en: "/en",
      gu: "/gu",
    },
  },
  openGraph: {
    type: "website",
    siteName: "Janmabhoomi Digital Newspaper",
    title: "Janmabhoomi | સમાચાર • વિશ્વાસ • નિષ્પક્ષતા",
    description:
      "Credible journalism since 1934. Read daily news previews and subscribe to the complete Janmabhoomi E-Paper.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Janmabhoomi | સમાચાર • વિશ્વાસ • નિષ્પક્ષતા",
    description:
      "Credible journalism since 1934. Read daily news previews and subscribe to the complete Janmabhoomi E-Paper.",
    site: "@janmabhoomi",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
      <body className="min-h-screen flex flex-col bg-[#FAF8F3] text-[#292725] antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
