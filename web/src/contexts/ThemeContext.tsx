/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface Theme {
  card_bg?: string;
  title_bg?: string;
  accent?: string;
  progress_color?: string;
  tag_bg?: string;
  tag_fg?: string;
  code_bg?: string;
  code_fg?: string;
}

export interface ThemeContextProps {
  themes: Record<string, Theme | undefined>;
  themeType: string;
  setThemeType: (type: string) => void;
  updateTheme: (type: string, theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeType, setThemeType] = useState<string>("default");
  const [themes, setThemes] = useState<Record<string, Theme | undefined>>({
    default: {
      card_bg: "rgba(18, 18, 20, 0.98)",
      title_bg: "rgba(255, 255, 255, 0.02)",
      accent: "#10b981",
      progress_color: "#10b981",
    },
    ambulancia: {
      card_bg: "rgba(18, 18, 20, 0.98)",
      title_bg: "rgba(220, 38, 38, 0.1)",
      accent: "#ef4444",
      progress_color: "#ef4444",
    },
    police: {
      card_bg: "rgba(18, 18, 20, 0.98)",
      title_bg: "rgba(37, 99, 235, 0.1)",
      accent: "#3b82f6",
      progress_color: "#3b82f6",
    },
    bombeiro: {
      card_bg: "rgba(18, 18, 20, 0.98)",
      title_bg: "rgba(217, 119, 6, 0.1)",
      accent: "#f59e0b",
      progress_color: "#f59e0b",
    },
    recrutamento: {
      card_bg: "rgba(18, 18, 20, 0.98)",
      title_bg: "rgba(147, 51, 234, 0.1)",
      accent: "#a855f7",
      progress_color: "#a855f7",
    },
  });

  useEffect(() => {
    const handler = (ev: MessageEvent) => {
      const d = ev.data;
      if (d.action === "init" && d.themes) {
        setThemes((prev) => ({ ...prev, ...d.themes }));
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const updateTheme = (type: string, theme: Theme) => {
    setThemes((prev) => ({ ...prev, [type]: theme }));
  };

  return (
    <ThemeContext.Provider value={{ themes, themeType, setThemeType, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
