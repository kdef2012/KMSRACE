import { Geist, Geist_Mono, DynaPuff, Sedgwick_Ave_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dynapuff = DynaPuff({
  variable: "--font-dynapuff",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sedgwick = Sedgwick_Ave_Display({
  variable: "--font-graffiti",
  subsets: ["latin"],
  weight: "400",
});

export const metadata = {
  title: "KMS Owls Competition",
  description: "Expectations of Excellence",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${dynapuff.variable} ${sedgwick.variable}`}>
      <body>{children}</body>
    </html>
  );
}
