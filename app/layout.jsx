import "@/index.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Festalytics - Event Planning Made Easy",
  description: "Plan your perfect event with AI and discover the best venues.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>{children}</body>
    </html>
  );
}
