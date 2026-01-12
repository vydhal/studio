
"use client";

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import type { HomeSettings } from '@/types';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';


interface AppContextType {
  settings: HomeSettings | null;
  loading: boolean;
  appName: string;
}

const defaultSettings: HomeSettings = {
  appName: "School Central",
  title: 'Bem-vindo ao School Central',
  subtitle: 'Sua plataforma completa para gerenciamento de censo escolar.',
  description: 'Nossa plataforma simplifica a coleta e análise de dados do censo escolar, fornecendo insights valiosos para gestores e administradores.',
  logoUrl: '',
  footerText: `© ${new Date().getFullYear()} School Central. Todos os Direitos Reservados.`,
  facebookUrl: '#',
  instagramUrl: '#',
  twitterUrl: '#',
};

export const AppContext = createContext<AppContextType>({ settings: null, loading: true, appName: "School Central" });

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<HomeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [appName, setAppName] = useState(defaultSettings.appName);

  useEffect(() => {
    if (!db) {
      // Handle case where Firestore is not initialized (e.g., test env)
      setSettings(defaultSettings);
      setAppName(defaultSettings.appName);
      document.title = defaultSettings.appName;
      setLoading(false);
      return;
    }

    const settingsRef = doc(db, 'settings', 'homePage');
    const unsubscribe = onSnapshot(settingsRef, (doc) => {
      let appSettings = defaultSettings;
      if (doc.exists()) {
        appSettings = { ...defaultSettings, ...doc.data() as HomeSettings };
      }

      setSettings(appSettings);
      const newAppName = appSettings.appName || defaultSettings.appName;
      setAppName(newAppName);
      document.title = newAppName;
      setLoading(false);
    }, (error) => {
      console.error("Failed to fetch settings from Firestore:", error);
      setSettings(defaultSettings);
      setAppName(defaultSettings.appName);
      document.title = defaultSettings.appName;
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Effect to apply brand colors
  useEffect(() => {
    if (settings?.primaryColor) {
      const root = document.documentElement;
      // Convert hex to HSL for Shadcn/Tailwind compability if needed, 
      // but for now let's assume valid Hex/HSL or simple overriding if we were using HSL vars.
      // However, shadcn uses HSL values in CSS vars (e.g. 222.2 47.4% 11.2%).
      // To do this properly we need to convert HEX to HSL.
      // For simplicity, let's just assume the user knows or we add a helper.
      // ACTUALLY: The easiest way for now is to just set it if we can, but since our globals.css uses HSL,
      // we must convert. Let's add a small helper function.

      const hexToHSL = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return null;
        let r = parseInt(result[1], 16);
        let g = parseInt(result[2], 16);
        let b = parseInt(result[3], 16);
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s, l = (max + min) / 2;
        if (max === min) {
          h = s = 0;
        } else {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }
        h = Math.round(h * 360);
        s = Math.round(s * 100);
        l = Math.round(l * 100);
        return `${h} ${s}% ${l}%`;
      };

      const hsl = hexToHSL(settings.primaryColor);
      if (hsl) {
        root.style.setProperty('--primary', hsl);
        root.style.setProperty('--ring', hsl);
      }
    }
  }, [settings?.primaryColor]);

  return (
    <AppContext.Provider value={{ settings, loading, appName }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppSettings = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppProvider');
  }
  return context;
}
