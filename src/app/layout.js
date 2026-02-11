import { Inter } from "next/font/google"; // 1. Import Inter
import "./globals.css";

// Layout
import Layout from "@/components/layout/Layout";

// Toast Container
import { Toaster } from "react-hot-toast";

// 2. Configure Inter
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // Matches the variable used in your globals.css
  display: "swap",
});

export const metadata = {
  title: "HRIS | LJA POWER LIMITED CO",
  description: "HR Management System",
};

export default function RootLayout({ children }) {
  return (
    <html data-theme="lja-light" lang="en">
      <body
        // 3. Apply the Inter variable here
        className={`${inter.variable} h-screen w-full flex overflow-hidden`}
      >
        <Toaster />
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
