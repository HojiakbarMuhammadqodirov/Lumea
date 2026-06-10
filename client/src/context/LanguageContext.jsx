import { createContext, useContext, useState } from "react";

const LANGS = ["uz", "en", "ru"];
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem("lumea_lang");
    return LANGS.includes(saved) ? saved : "uz";
  });

  const cycle = () => setLang((l) => {
    const next = LANGS[(LANGS.indexOf(l) + 1) % LANGS.length];
    localStorage.setItem("lumea_lang", next);
    return next;
  });

  const toggle = cycle; // backwards compat

  return (
    <LanguageContext.Provider value={{ lang, setLang, cycle, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
