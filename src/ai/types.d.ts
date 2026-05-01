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
    prompt?: string;
    /** 生成の多様性（0.0〜1.0） */
    temperature?: number;
    /** 最大出力トークン数 */
    maxTokens?: number;
    /** メッセージ履歴（チャット形式の場合に使用） */
    messages?: Array<{
        /** ロール（user, assistant, system, tool） */
        role: 'user' | 'assistant' | 'system' | 'tool';
        /** メッセージ内容 */
        content: string;
        /** ツール呼び出しID（ロールが tool の場合や assistant がツールを呼ぶ場合） */
        toolCallId?: string;
        /** ツール名（ロールが assistant がツールを呼ぶ場合） */
        toolName?: string;
    }>;
    /** 使用可能なツール */
    tools?: AiTool[];
}
/**
 * ツール（Tool）のインターフェース
 * 単一の機能を実行します。OpenAI/GeminiのTool Callingと互換性のある形式です。
 */
export interface AiTool {
    /** ツール名（英数字とアンダースコア推奨） */
    name: string;
    /** ツールが何をするかの説明（LLMがいつ使用するかを判断するために使用） */
    description: string;
    /** ツールに渡す引数の定義（JSON Schema 形式） */
    parameters: Record<string, any>;
    /** ツールの実行処理 */
    execute(args: any): Promise<any>;
}
/**
 * エージェント（Agent）のインターフェース
 * ペルソナを持ち、チャット履歴を管理し、ツールを組み合わせて使用できます。
 * エージェント自体もツールとして振る舞うことができます。
 */
export interface AiAgent extends AiTool {
    /** エージェントのペルソナ（システムプロンプト） */
    persona: string;
    /** 使用するAIドライバー */
    driver: AiDriver;
    /** エージェントが利用可能なツールのリスト */
    tools?: AiTool[];
    /** チャットを実行します */
    chat(message: string): Promise<string>;
}
/**
 * パイプライン（Pipeline）のインターフェース
 * 複数のエージェントやツールを順次、または複雑なロジックで実行します。
 * パイプライン自体もツールとして振る舞うことができます。
 */
export interface AiPipeline extends AiTool {
    /** 実行するステップのリスト */
    steps: Array<AiTool>;
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
    testConnection(): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * 利用可能なモデルの一覧を取得します
     * @returns モデル名の配列
     */
    fetchModels(): Promise<string[]>;
}
