import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import BottomNav from "@/components/BottomNav";
import PageBackButton from "@/components/PageBackButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://docly.debcreatives.net"),
  title: {
    default: "Doctors in Bangladesh | বাংলাদেশের ডাক্তার খুঁজুন | Docly",
    template: "%s | Docly",
  },
  description:
    "Find doctors and specialists across Bangladesh. বাংলাদেশের বিভিন্ন জেলার ডাক্তারদের বিশেষজ্ঞতা, চেম্বারের ঠিকানা, রোগী দেখার সময় ও সিরিয়ালের যোগাযোগের তথ্য খুঁজুন Docly-তে।",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="bn"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><Suspense fallback={null}>
  <PageBackButton />
</Suspense>

{children}

<Suspense
  fallback={
    <div
  aria-hidden="true"
  className="md:hidden"
  style={{ height: "calc(88px + env(safe-area-inset-bottom))" }}
/>
  }
>
  <BottomNav />
</Suspense>
</body>
    </html>
  );
}
