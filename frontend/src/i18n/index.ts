import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import sw from "./sw.json";
import en from "./en.json";
import { STORAGE_KEYS } from "@/lib/config";

const stored = localStorage.getItem(STORAGE_KEYS.language);
const lng = stored === "en" ? "en" : "sw";

i18n.use(initReactI18next).init({
  resources: {
    sw: { translation: sw },
    en: { translation: en },
  },
  lng,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
