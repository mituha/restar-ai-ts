import { generateText, streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { AiDriver, GenerationOptions, ProviderSettings } from '../types';

export class GeminiDriver implements AiDriver {
    private google: any;
    private settings: ProviderSettings;

    constructor(settings: ProviderSettings) {
        this.settings = settings;
        this.google = createGoogleGenerativeAI({
            apiKey: settings.apiKey || 'missing-key',
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
            if (!this.settings.apiKey) {
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
        const apiKey = this.settings.apiKey;
        if (!apiKey) return ["gemini-1.5-pro-latest", "gemini-1.5-flash-latest"];

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
            { method: 'GET' }
        );

        if (!response.ok) {
            const errorData = await response.json() as any;
            throw new Error(errorData?.error?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json() as { models: { name: string; supportedGenerationMethods: string[] }[] };

        return data.models
            .filter(m => m.supportedGenerationMethods.includes('generateContent'))
            .map(m => m.name.replace(/^models\//, ''));
    }
}
