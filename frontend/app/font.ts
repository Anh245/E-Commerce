import { Inter, Playfair_Display } from "next/font/google";

export const inter = Inter({
  variable: "--font-graphik",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "400", "500"],
});

export const playfair = Playfair_Display({
  variable: "--font-nantes",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  style: ["normal", "italic"],
});
