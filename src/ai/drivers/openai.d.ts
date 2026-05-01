import type { AiDriver, GenerationOptions, ProviderSettings } from '../types';
/**
 * OpenAI API および互換 API (LM Studio 等) を使用するためのドライバー実装
 */
export declare class OpenAiDriver implements AiDriver {
    private openai;
    private settings;
    private isLmStudio;
    private customFetch?;
    private resolvedApiKey;
    /**
     * OpenAiDriver を初期化します
     * @param settings プロバイダー設定
     * @param isLmStudio LM Studio 等のローカル互換サーバーかどうか
     * @param customFetch カスタムfetch関数
     */
    constructor(settings: ProviderSettings, isLmStudio?: boolean, customFetch?: typeof fetch);
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
     * OpenAI 互換 API から利用可能なモデル一覧を取得します
     * @returns モデル名の配列
     */
    fetchModels(): Promise<string[]>;
}
