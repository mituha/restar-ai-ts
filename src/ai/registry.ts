import { GeminiDriver } from './drivers/gemini';
import { OpenAiDriver } from './drivers/openai';
import type { AiDriver, AiProvider, ProviderSettings } from './types';

/**
 * 指定されたプロバイダーと設定に基づいて AI ドライバーを生成します。
 * 
 * @param provider AIプロバイダーの種類 ('gemini', 'openai', 'lmstudio')
 * @param settings APIキーやエンドポイントなどの設定
 * @param config 拡張設定（カスタムfetch関数など）
 * @returns プロバイダーに対応する AiDriver インスタンス
 * @throws サポートされていないプロバイダーが指定された場合にエラーを投げます
 */
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
