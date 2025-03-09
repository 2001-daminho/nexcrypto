
import { createContext, ReactNode } from "react";

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeContext = createContext({
  theme: "dark",
});

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={{ theme: "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}
