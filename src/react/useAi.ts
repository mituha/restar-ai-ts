import { useState, useCallback, useMemo } from 'react';
import { createAiDriver } from '../ai/registry';
import type { AiProvider, ProviderSettings, GenerationOptions, AiStreamChunk } from '../ai/types';

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
export function useAi({ provider, settings }: UseAiOptions) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const driver = useMemo(() => createAiDriver(provider, settings), [provider, settings]);

    const generate = useCallback(async (options: GenerationOptions) => {
        setIsGenerating(true);
        setError(null);
        try {
            const result = await driver.generateText(options);
            return result;
        } catch (err: any) {
            const msg = err.message || String(err);
            setError(msg);
            throw err;
        } finally {
            setIsGenerating(false);
        }
    }, [driver]);

    const stream = useCallback(async (options: GenerationOptions, onChunk: (chunk: AiStreamChunk) => void) => {
        setIsGenerating(true);
        setError(null);
        try {
            const chunkStream = await driver.streamText(options);
            const reader = chunkStream.getReader();
            let fullText = '';
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                if (value.type === 'text') {
                    fullText += value.content;
                }
                onChunk(value);
            }
            return fullText;
        } catch (err: any) {
            const msg = err.message || String(err);
            setError(msg);
            throw err;
        } finally {
            setIsGenerating(false);
        }
    }, [driver]);

    return {
        generate,
        stream,
        isGenerating,
        error,
        driver // Expose driver for other methods like fetchModels
    };
}
