"use client";

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import type { HomeSettings } from '@/types';

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

const SETTINGS_STORAGE_KEY = 'homePageSettings';

export const AppContext = createContext<AppContextType>({ settings: null, loading: true, appName: "School Central" });

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<HomeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [appName, setAppName] = useState(defaultSettings.appName);

  useEffect(() => {
    // This effect runs once on the client side
    try {
        const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
        const appSettings = storedSettings ? JSON.parse(storedSettings) : defaultSettings;
        setSettings(appSettings);
        setAppName(appSettings.appName || defaultSettings.appName);
        
        // Update document title
        if (appSettings.appName) {
            document.title = appSettings.appName;
        }

    } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
        setSettings(defaultSettings);
        setAppName(defaultSettings.appName);
        document.title = defaultSettings.appName;
    } finally {
        setLoading(false);
    }
  }, []);

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
