import { useState, useEffect } from 'react';
import type { AiProvider, ProviderSettings } from 'restar-ai-ts';

const STORAGE_KEY_PROVIDER = 'restar-ai-provider';
const STORAGE_KEY_SETTINGS = 'restar-ai-settings';

const DEFAULT_SETTINGS: Record<AiProvider, ProviderSettings> = {
    gemini: { apiKey: '', endpoint: '', model: 'gemini-1.5-flash-latest' },
    openai: { apiKey: '', endpoint: 'https://api.openai.com/v1', model: 'gpt-4o' },
    lmstudio: { apiKey: '', endpoint: 'http://localhost:1234/v1', model: 'local-model' }
};

export function useSettings() {
    const [provider, setProvider] = useState<AiProvider>(() => {
        return (localStorage.getItem(STORAGE_KEY_PROVIDER) as AiProvider) || 'gemini';
    });

    const [allSettings, setAllSettings] = useState<Record<AiProvider, ProviderSettings>>(() => {
        const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (saved) return JSON.parse(saved);

        // フォールバック：環境変数からの取得を試みる
        const initial = { ...DEFAULT_SETTINGS };
        
        // @ts-ignore
        const envGemini = import.meta.env?.VITE_GEMINI_API_KEY;
        if (envGemini) initial.gemini.apiKey = envGemini;
        
        // @ts-ignore
        const envOpenAI = import.meta.env?.VITE_OPENAI_API_KEY;
        if (envOpenAI) initial.openai.apiKey = envOpenAI;

        return initial;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_PROVIDER, provider);
    }, [provider]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(allSettings));
    }, [allSettings]);

    const updateProviderSettings = (newSettings: ProviderSettings) => {
        setAllSettings(prev => ({ ...prev, [provider]: newSettings }));
    };

    return {
        provider,
        setProvider,
        settings: allSettings[provider],
        updateProviderSettings,
        allSettings
    };
}
