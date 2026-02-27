import type { Metadata } from "next";
import "./index.css";

export const metadata: Metadata = {
  title: "tiboryeah | MyLinks",
  description: "Social links and Discord presence of tiboryeah",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "tiboryeah | MyLinks",
    description: "Social links and Discord presence of tiboryeah",
    images: [{ url: "/og-image.png" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
