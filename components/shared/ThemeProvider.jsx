"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "horizons-theme";
const ThemeContext = createContext(null);

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  return resolved;
}

export default function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("system");
  const [resolvedTheme, setResolvedTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY) || "system";
    setThemeState(savedTheme);
    setResolvedTheme(applyTheme(savedTheme));

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      setResolvedTheme(applyTheme(localStorage.getItem(STORAGE_KEY) || "system"));
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme(nextTheme) {
        if (nextTheme === "system") {
          localStorage.removeItem(STORAGE_KEY);
        } else {
          localStorage.setItem(STORAGE_KEY, nextTheme);
        }
        setThemeState(nextTheme);
        setResolvedTheme(applyTheme(nextTheme));
      },
      toggleTheme() {
        const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
        localStorage.setItem(STORAGE_KEY, nextTheme);
        setThemeState(nextTheme);
        setResolvedTheme(applyTheme(nextTheme));
      },
    }),
    [resolvedTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
