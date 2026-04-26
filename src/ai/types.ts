/**
 * サポートされているAIプロバイダーの種類
 */
export type AiProvider = "gemini" | "openai" | "lmstudio";

/**
 * 各AIプロバイダーの設定情報
 */
export interface ProviderSettings {
    /** APIキー */
    apiKey: string;
    /** APIエンドポイントのベースURL */
    endpoint: string;
    /** 使用するモデル名 */
    model: string;
}

/**
 * 全プロバイダーの設定を保持する型
 */
export type AllProviderSettings = Record<AiProvider, ProviderSettings>;

/**
 * テキスト生成時のオプション
 */
export interface GenerationOptions {
    /** システムプロンプト（指示） */
    system?: string;
    /** ユーザープロンプト */
    prompt: string;
    /** 生成の多様性（0.0〜1.0） */
    temperature?: number;
    /** 最大出力トークン数 */
    maxTokens?: number;
    /** メッセージ履歴（チャット形式の場合に使用） */
    messages?: Array<{ 
        /** ロール（user, assistant, system） */
        role: 'user' | 'assistant' | 'system'; 
        /** メッセージ内容 */
        content: string 
    }>;
}

/**
 * 各AIプロバイダーを抽象化するドライバーインターフェース
 */
export interface AiDriver {
    /**
     * テキストを生成します
     * @param options 生成オプション
     * @returns 生成されたテキスト
     */
    generateText(options: GenerationOptions): Promise<string>;

    /**
     * テキストをストリーミング形式で生成します
     * @param options 生成オプション
     * @returns テキストチャンクの ReadableStream
     */
    streamText(options: GenerationOptions): Promise<ReadableStream<string>>;

    /**
     * APIへの接続テストを行います
     * @returns テスト結果（成功可否とメッセージ）
     */
    testConnection(): Promise<{ success: boolean; message: string }>;

    /**
     * 利用可能なモデルの一覧を取得します
     * @returns モデル名の配列
     */
    fetchModels(): Promise<string[]>;
}
