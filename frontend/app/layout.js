import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import FacebookPixel from "@/components/FacebookPixel";

const manrope = Manrope({
  variable: "--font-brand-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-brand-display",
  subsets: ["latin"],
});

export const metadata = {
  title: "EBook Marketplace - Buy, Read & Publish Books",
  description: "Discover millions of books. Connect with publishers. Start reading today.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${spaceGrotesk.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-transparent text-slate-900">
        <Providers>
          <FacebookPixel />
          {children}
        </Providers>
      </body>
    </html>
  );
}
