import { createContext, useState, useEffect } from "react";

export const ThemeLanguageContext = createContext();

export function ThemeLanguageProvider({ children }) {
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // Cập nhật class của HTML theo theme
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Cập nhật localStorage khi đổi ngôn ngữ
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  return (
    <ThemeLanguageContext.Provider value={{ language, setLanguage, theme, setTheme }}>
      {children}
    </ThemeLanguageContext.Provider>
  );
}
