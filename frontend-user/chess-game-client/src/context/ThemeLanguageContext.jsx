import { createContext, useState, useEffect } from "react";

export const ThemeLanguageContext = createContext();

export function ThemeLanguageProvider({ children }) {
  // Lấy theme & language từ localStorage hoặc mặc định
  const [language, setLanguage] = useState(() => localStorage.getItem("language") || "en");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  // Hàm đổi ngôn ngữ, chỉ cập nhật nếu có thay đổi
  const changeLanguage = (newLang) => {
    if (newLang !== language) {
      setLanguage(newLang);
      localStorage.setItem("language", newLang);
    }
  };

  // Hàm đổi theme, chỉ cập nhật nếu có thay đổi
  const changeTheme = (newTheme) => {
    if (newTheme !== theme) {
      setTheme(newTheme);
      localStorage.setItem("theme", newTheme);
    }
  };

  // Cập nhật class của HTML khi theme thay đổi
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <ThemeLanguageContext.Provider value={{ language, setLanguage: changeLanguage, theme, setTheme: changeTheme }}>
      {children}
    </ThemeLanguageContext.Provider>
  );
}
