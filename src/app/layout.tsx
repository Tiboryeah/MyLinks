import type { Metadata } from "next";
import "./index.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://my-links-orpin.vercel.app"),
  title: "tiboryeah | Mi universo digital",
  description: "Discord en vivo, música, gaming y proyectos creativos. Todo mi universo, en un solo lugar.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/icon.webp",
    apple: "/apple-icon.webp",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "tiboryeah | MyLinks",
    locale: "en_US",
    title: "tiboryeah | Mi universo digital",
    description: "Discord en vivo, música, gaming y proyectos creativos. Todo mi universo, en un solo lugar.",
    images: [{
      url: "/og-preview-v2.jpg",
      width: 1200,
      height: 630,
      alt: "Logo de tiboryeah — Mi universo digital",
      type: "image/jpeg",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "tiboryeah | Mi universo digital",
    description: "Discord en vivo, música, gaming y proyectos creativos. Todo mi universo, en un solo lugar.",
    images: ["/og-preview-v2.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bangers&family=BioRhyme:wght@400;700&family=Caveat:wght@700&family=Chicle&family=MuseoModerno:wght@600;700&family=Permanent+Marker&family=Pixelify+Sans:wght@600;700&family=Zilla+Slab:wght@600;700&family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
