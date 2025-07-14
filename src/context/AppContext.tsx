
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
