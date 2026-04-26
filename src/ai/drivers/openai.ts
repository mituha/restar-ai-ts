import { generateText, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import type { AiDriver, GenerationOptions, ProviderSettings } from '../types';

export class OpenAiDriver implements AiDriver {
    private openai: any;
    private settings: ProviderSettings;
    private isLmStudio: boolean;
    private customFetch?: typeof fetch;
    private resolvedApiKey: string;

    constructor(settings: ProviderSettings, isLmStudio: boolean = false, customFetch?: typeof fetch) {
        this.settings = settings;
        this.isLmStudio = isLmStudio;
        this.customFetch = customFetch;

        // APIキーの決定（引数 > process.env > import.meta.env）
        let apiKey = settings.apiKey;
        if (!apiKey || apiKey === '') {
            const g = globalThis as any;
            if (typeof g.process !== 'undefined' && g.process.env) {
                apiKey = g.process.env.OPENAI_API_KEY || '';
            }
            // @ts-ignore
            if (!apiKey && typeof import.meta !== 'undefined' && import.meta.env) {
                // @ts-ignore
                apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
            }
        }
        this.resolvedApiKey = apiKey;

        this.openai = createOpenAI({
            apiKey: apiKey || (isLmStudio ? 'not-needed' : 'missing-key'),
            baseURL: settings.endpoint || (isLmStudio ? 'http://localhost:1234/v1' : 'https://api.openai.com/v1'),
            fetch: customFetch as any
        });
    }

    private getModelInstance() {
        return this.openai(this.settings.model || (this.isLmStudio ? 'local-model' : 'gpt-4o'));
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
            if (!this.isLmStudio && !this.resolvedApiKey) {
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
            console.error("OpenAI/LMStudio Connection test failed:", error);
            return { success: false, message: `接続エラー: ${error.message || String(error)}` };
        }
    }

    async fetchModels(): Promise<string[]> {
        const baseUrl = this.settings.endpoint || (this.isLmStudio ? 'http://localhost:1234/v1' : 'https://api.openai.com/v1');
        const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
        const fetchFn = this.customFetch || fetch;

        try {
            const response = await fetchFn(`${normalizedBaseUrl}/models`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.resolvedApiKey || 'not-needed'}`,
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json() as { data: { id: string }[] };
            return data.data.map(m => m.id);
        } catch (error) {
            console.error('Failed to fetch OpenAI models:', error);
            return this.isLmStudio ? ['local-model'] : ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];
        }
    }
}
