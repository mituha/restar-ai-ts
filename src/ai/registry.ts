import { GeminiDriver } from './drivers/gemini';
import { OpenAiDriver } from './drivers/openai';
import type { AiDriver, AiProvider, ProviderSettings } from './types';

export function createAiDriver(
    provider: AiProvider, 
    settings: ProviderSettings,
    config?: { fetch?: typeof fetch }
): AiDriver {
    switch (provider) {
        case 'gemini':
            return new GeminiDriver(settings, config?.fetch);
        case 'openai':
            return new OpenAiDriver(settings, false, config?.fetch);
        case 'lmstudio':
            return new OpenAiDriver(settings, true, config?.fetch);
        default:
            throw new Error(`Unsupported AI Provider: ${provider}`);
    }
}
