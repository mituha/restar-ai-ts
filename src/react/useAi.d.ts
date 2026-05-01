import type { AiProvider, ProviderSettings, GenerationOptions } from '../ai/types';
/**
 * useAi フックのオプション
 */
export interface UseAiOptions {
    /** 使用するAIプロバイダー */
    provider: AiProvider;
    /** プロバイダーの設定 */
    settings: ProviderSettings;
}
/**
 * AIによる生成機能を提供するReactフック
 *
 * @param options プロバイダーと設定
 * @returns 生成用メソッドと状態
 */
export declare function useAi({ provider, settings }: UseAiOptions): {
    generate: (options: GenerationOptions) => Promise<string>;
    stream: (options: GenerationOptions, onChunk: (chunk: string) => void) => Promise<string>;
    isGenerating: boolean;
    error: string | null;
    driver: import("..").AiDriver;
};
