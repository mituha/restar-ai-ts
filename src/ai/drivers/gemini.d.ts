import type { AiDriver, GenerationOptions, ProviderSettings } from '../types';
/**
 * Google Gemini API を使用するためのドライバー実装
 */
export declare class GeminiDriver implements AiDriver {
    private google;
    private settings;
    private customFetch?;
    private resolvedApiKey;
    /**
     * GeminiDriver を初期化します
     * @param settings プロバイダー設定
     * @param customFetch カスタムfetch関数
     */
    constructor(settings: ProviderSettings, customFetch?: typeof fetch);
    private getModelInstance;
    /**
     * 指定されたオプションでテキストを生成します
     * @param options 生成オプション
     * @returns 生成されたテキスト
     */
    generateText(options: GenerationOptions): Promise<string>;
    /**
     * 指定されたオプションでテキストをストリーミング生成します
     * @param options 生成オプション
     * @returns テキストチャンクのストリーム
     */
    streamText(options: GenerationOptions): Promise<ReadableStream<string>>;
    /**
     * APIへの接続テストを行います
     * @returns テスト結果
     */
    testConnection(): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Google AI API から利用可能なモデル一覧を取得します
     * @returns モデル名の配列
     */
    fetchModels(): Promise<string[]>;
}
