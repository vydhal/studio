
"use client";

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import type { HomeSettings, FormSectionConfig } from '@/types';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';


interface AppContextType {
  settings: (HomeSettings & { formConfig?: FormSectionConfig[] }) | null;
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
  const [settings, setSettings] = useState<AppContextType['settings']>(null);
  const [loading, setLoading] = useState(true);
  const [appName, setAppName] = useState(defaultSettings.appName);

  useEffect(() => {
    if (!db) {
        setSettings(defaultSettings);
        setAppName(defaultSettings.appName);
        document.title = defaultSettings.appName;
        setLoading(false);
        return;
    }

    const homeSettingsRef = doc(db, 'settings', 'homePage');
    const formConfigRef = doc(db, 'settings', 'formConfig');

    const unsubHome = onSnapshot(homeSettingsRef, (doc) => {
        const homeData = doc.exists() ? doc.data() as HomeSettings : {};
        setSettings(prev => ({ ...prev, ...defaultSettings, ...homeData }));
        const newAppName = homeData.appName || defaultSettings.appName;
        setAppName(newAppName);
        document.title = newAppName;
    }, (error) => {
        console.error("Failed to fetch home settings:", error);
        setSettings(prev => ({ ...prev, ...defaultSettings }));
    });

    const unsubForm = onSnapshot(formConfigRef, (doc) => {
        const formData = doc.exists() ? (doc.data()?.sections as FormSectionConfig[]) : [];
        if (formData && !formData.some(s => s.id === 'professionals')) {
             const infraIndex = formData.findIndex(s => s.id.startsWith('infra'));
            const newSection = { id: 'professionals', name: 'Profissionais', description: 'Alocação de profissionais por turma.', fields: [] };
            if (infraIndex !== -1) {
                formData.splice(infraIndex + 1, 0, newSection);
            } else {
                formData.push(newSection);
            }
        }
        setSettings(prev => ({ ...prev, formConfig: formData }));
    }, (error) => {
        console.error("Failed to fetch form config:", error);
        setSettings(prev => ({...prev, formConfig: [] }));
    });

    const checkLoading = () => {
       if (settings !== null) {
         setLoading(false);
       }
    };
    // A simple way to stop loading, you might want a more robust solution
    const timer = setTimeout(checkLoading, 1500);


    return () => {
        unsubHome();
        unsubForm();
        clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

   useEffect(() => {
    if (settings?.appName && settings.formConfig) {
      setLoading(false);
    }
  }, [settings]);

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
