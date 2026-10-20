import { createContext, useContext } from "react";

export type PortfolioTheme = {
  theme: "dark" | "light";
  toggleTheme: () => void;
};

export const PortfolioThemeContext = createContext<PortfolioTheme | null>(null);

export function usePortfolioTheme() {
  const theme = useContext(PortfolioThemeContext);
  if (!theme) throw new Error("usePortfolioTheme must be used inside the portfolio root.");
  return theme;
}
