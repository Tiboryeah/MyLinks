import type { Metadata } from "next";
import "./index.css";

export const metadata: Metadata = {
  title: "tiboryeah | MyLinks",
  description: "Social links and Discord presence of tiboryeah",
  icons: {
    icon: "/icon.webp",
    apple: "/apple-icon.webp",
  },
  openGraph: {
    title: "tiboryeah | MyLinks",
    description: "Social links and Discord presence of tiboryeah",
    images: [{ url: "/og-image.webp" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.webp"],
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
