export type AiProvider = "gemini" | "openai" | "lmstudio";

export interface ProviderSettings {
    apiKey: string;
    endpoint: string;
    model: string;
}

export type AllProviderSettings = Record<AiProvider, ProviderSettings>;

export interface GenerationOptions {
    system?: string;
    prompt: string;
    temperature?: number;
    maxTokens?: number;
    messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
}

export interface AiDriver {
    generateText(options: GenerationOptions): Promise<string>;
    streamText(options: GenerationOptions): Promise<ReadableStream<string>>;
    testConnection(): Promise<{ success: boolean; message: string }>;
    fetchModels(): Promise<string[]>;
}
