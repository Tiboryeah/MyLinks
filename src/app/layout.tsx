import type { Metadata } from "next";
import "./index.css";

export const metadata: Metadata = {
  title: "tiboryeah | MyLinks",
  description: "Social links and Discord presence of tiboryeah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
