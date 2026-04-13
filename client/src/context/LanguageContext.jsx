import { createContext, useContext, useState } from "react";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("uz"); // default: Uzbek
  const toggle = () => setLang((l) => (l === "uz" ? "en" : "uz"));
  return (
    <LanguageContext.Provider value={{ lang, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
