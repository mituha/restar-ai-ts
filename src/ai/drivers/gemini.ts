import { generateText, streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { AiDriver, GenerationOptions, ProviderSettings } from '../types';

export class GeminiDriver implements AiDriver {
    private google: any;
    private settings: ProviderSettings;
    private customFetch?: typeof fetch;
    private resolvedApiKey: string;

    constructor(settings: ProviderSettings, customFetch?: typeof fetch) {
        this.settings = settings;
        this.customFetch = customFetch;

        // APIキーの決定（引数 > process.env > import.meta.env）
        let apiKey = settings.apiKey;
        if (!apiKey || apiKey === '') {
            const g = globalThis as any;
            if (typeof g.process !== 'undefined' && g.process.env) {
                apiKey = g.process.env.GEMINI_API_KEY || g.process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
            }
            // @ts-ignore
            if (!apiKey && typeof import.meta !== 'undefined' && import.meta.env) {
                // @ts-ignore
                apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY || '';
            }
        }
        this.resolvedApiKey = apiKey;

        this.google = createGoogleGenerativeAI({
            apiKey: apiKey || 'missing-key',
            baseURL: settings.endpoint || undefined,
            fetch: customFetch as any
        });
    }

    private getModelInstance() {
        return this.google(this.settings.model || 'gemini-1.5-pro-latest');
    }

    async generateText(options: GenerationOptions): Promise<string> {
        const { text } = await generateText({
            model: this.getModelInstance(),
            system: options.messages ? undefined : options.system,
            prompt: options.messages ? undefined : options.prompt,
            messages: options.messages as any,
            temperature: options.temperature,
            maxOutputTokens: options.maxTokens,
        });
        return text.trim();
    }

    async streamText(options: GenerationOptions): Promise<ReadableStream<string>> {
        const { textStream } = await streamText({
            model: this.getModelInstance(),
            system: options.messages ? undefined : options.system,
            prompt: options.messages ? undefined : options.prompt,
            messages: options.messages as any,
            temperature: options.temperature,
            maxOutputTokens: options.maxTokens,
        });
        return textStream;
    }

    async testConnection(): Promise<{ success: boolean; message: string }> {
        try {
            if (!this.resolvedApiKey) {
                return { success: false, message: 'APIキーが設定されていません。' };
            }

            const text = await this.generateText({
                prompt: 'Hi! Connection test. Reply with "SUCCESS".'
            });

            if (text && text.length > 0) {
                return { success: true, message: `接続成功: ${text}` };
            } else {
                return { success: false, message: '接続は成功しましたが、空の応答が返されました。' };
            }
        } catch (error: any) {
            console.error("Gemini Connection test failed:", error);
            return { success: false, message: `接続エラー: ${error.message || String(error)}` };
        }
    }

    async fetchModels(): Promise<string[]> {
        const apiKey = this.resolvedApiKey;
        if (!apiKey) return ["gemini-1.5-pro-latest", "gemini-1.5-flash-latest"];

        const baseUrl = (this.settings.endpoint || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '');
        const fetchFn = this.customFetch || fetch;

        try {
            const response = await fetchFn(
                `${baseUrl}/models?key=${apiKey}`,
                { method: 'GET' }
            );

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json() as any;
                    errorMessage = errorData?.error?.message || errorMessage;
                } catch (e) {
                    // Ignore JSON parse error
                }
                throw new Error(errorMessage);
            }

            const data = await response.json() as { models: { name: string; supportedGenerationMethods: string[] }[] };

            if (!data.models || !Array.isArray(data.models)) {
                return ["gemini-1.5-pro-latest", "gemini-1.5-flash-latest"];
            }

            return data.models
                .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
                .map(m => m.name.replace(/^models\//, ''));
        } catch (error: any) {
            console.error('Failed to fetch Gemini models:', error);
            // エラーが発生した場合はフォールバックを返す
            return ["gemini-1.5-pro-latest", "gemini-1.5-flash-latest"];
        }
    }
}
