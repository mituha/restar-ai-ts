import { GeminiDriver } from './drivers/gemini';
import { OpenAiDriver } from './drivers/openai';
import type { AiDriver, AiProvider, ProviderSettings } from './types';

export function createAiDriver(provider: AiProvider, settings: ProviderSettings): AiDriver {
    switch (provider) {
        case 'gemini':
            return new GeminiDriver(settings);
        case 'openai':
            return new OpenAiDriver(settings);
        case 'lmstudio':
            return new OpenAiDriver(settings, true);
        default:
            throw new Error(`Unsupported AI Provider: ${provider}`);
    }
}
