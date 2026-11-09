import type { Metadata } from "next";
import "./globals.css";
import AutoSignOut from "./components/AutoSignOut";

export const metadata: Metadata = {
  title: "AcademicPro | Assignment Help",
  description: "Professional academic assignment help with expert writing, fast delivery, and full revision support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#f5f4f0] text-[#182329]">
        <AutoSignOut />
        {children}
      </body>
    </html>
  );
}
