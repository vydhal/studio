"use client";

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import type { HomeSettings } from '@/types';

interface AppContextType {
  settings: HomeSettings | null;
  loading: boolean;
}

const defaultSettings: HomeSettings = {
    appName: "Firebase School Central",
    title: 'Bem-vindo ao Firebase School Central',
    subtitle: 'Sua plataforma completa para gerenciamento de censo escolar.',
    description: 'Nossa plataforma simplifica a coleta e análise de dados do censo escolar, fornecendo insights valiosos para gestores e administradores.',
    logoUrl: 'https://placehold.co/100x100.png',
    footerText: `© ${new Date().getFullYear()} Firebase School Central. Todos os Direitos Reservados.`,
    facebookUrl: '#',
    instagramUrl: '#',
    twitterUrl: '#',
};

const SETTINGS_STORAGE_KEY = 'homePageSettings';

export const AppContext = createContext<AppContextType>({ settings: null, loading: true });

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<HomeSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
        const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
        const appSettings = storedSettings ? JSON.parse(storedSettings) : defaultSettings;
        setSettings(appSettings);
        
        // Update document title
        if (appSettings.appName) {
            document.title = appSettings.appName;
        }

    } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
        setSettings(defaultSettings);
    } finally {
        setLoading(false);
    }
  }, []);

  return (
    <AppContext.Provider value={{ settings, loading }}>
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
