import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Docly — আপনার এলাকায় ডাক্তার খুঁজুন",
 description:
  "বাংলাদেশের বিভিন্ন জেলার ডাক্তার, বিশেষজ্ঞতা, চেম্বারের ঠিকানা, রোগী দেখার সময় ও সিরিয়ালের তথ্য খুঁজুন Docly-তে।",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="bn"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
