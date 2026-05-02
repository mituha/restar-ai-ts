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
 * メッセージのロール
 */
export type AiMessageRole = 'system' | 'user' | 'assistant' | 'tool';

/**
 * コンテンツの構成要素（マルチモーダル対応用）
 */
export type AiContentPart = 
    | { type: 'text'; text: string }
    | { type: 'image'; image: string; mimeType: string };

/**
 * ツール呼び出しの詳細
 */
export interface AiToolCall {
    id: string;
    name: string;
    args: any;
}

/**
 * メッセージに付随するメタデータ
 */
export interface AiMessageMetadata {
    /** 生成を行ったエージェントのID */
    agentId?: string;
    /** 使用されたモデル名 */
    model?: string;
    /** トークン使用量 */
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    /** 生成終了理由（stop, length, tool_calls等） */
    finishReason?: string;
    /** その他プロバイダー固有の情報 */
    [key: string]: any;
}

/**
 * AIとのやり取りを構成する単一のメッセージ
 */
export interface AiMessage {
    /** メッセージの一意識別子 (UUID等) */
    id: string;
    /** ロール（system, user, assistant, tool） */
    role: AiMessageRole;
    /** メッセージの主内容。テキスト形式、またはパーツの配列 */
    content: string | AiContentPart[];
    /** モデルの推論・思考過程（存在する場合） */
    thought?: string;
    /** 作成日時（ミリ秒単位のUnixタイムスタンプ） */
    timestamp: number;
    /** アシスタントによるツール呼び出しのリスト（roleがassistantの場合） */
    toolCalls?: AiToolCall[];
    /** ツール実行結果の参照ID（roleがtoolの場合） */
    toolCallId?: string;
    /** 拡張メタデータ */
    metadata?: AiMessageMetadata;
}

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
    messages?: AiMessage[];
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
    chat(message: string): Promise<AiMessage>;
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
 * ストリーミング時のデータチャンク
 */
export interface AiStreamChunk {
    /** チャンクの種別 */
    type: 'text' | 'thought' | 'tool-call' | 'error';
    /** チャンクの内容 */
    content: string;
    /** 追加情報（ツール呼び出しID等） */
    metadata?: any;
}

/**
 * 各AIプロバイダーを抽象化するドライバーインターフェース
 */
export interface AiDriver {
    /**
     * テキストを生成します
     * @param options 生成オプション
     * @returns 生成されたメッセージ
     */
    generateText(options: GenerationOptions): Promise<AiMessage>;

    /**
     * テキストをストリーミング形式で生成します
     * @param options 生成オプション
     * @returns チャンクの ReadableStream
     */
    streamText(options: GenerationOptions): Promise<ReadableStream<AiStreamChunk>>;

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
