import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: { 
    translation: { 
      welcome: "Welcome", 
      login: "Login", 
      register: "Register", 
      logout: "Logout" 
    } 
  },
  fr: { 
    translation: { 
      welcome: "Bienvenue", 
      login: "Connexion", 
      register: "S'inscrire", 
      logout: "Déconnexion" 
    } 
  },
};

// Only initialize if we're in the browser
if (typeof window !== "undefined") {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: "en",
      fallbackLng: "en",
      interpolation: { escapeValue: false },
      react: {
        useSuspense: false, // Disable suspense for SSR compatibility
      },
    });
}

export default i18n;