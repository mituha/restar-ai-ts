import type { AiAgent, AiDriver, AiTool, AiMessage } from './types';

/**
 * エージェントの基本実装クラス
 */
export class BaseAgent implements AiAgent {
    public name: string;
    public description: string;
    public parameters: Record<string, any>;
    public persona: string;
    public driver: AiDriver;
    public tools: AiTool[];
    
    protected messages: AiMessage[] = [];

    constructor(config: {
        name: string;
        description: string;
        persona: string;
        driver: AiDriver;
        tools?: AiTool[];
        parameters?: Record<string, any>;
    }) {
        this.name = config.name;
        this.description = config.description;
        this.persona = config.persona;
        this.driver = config.driver;
        this.tools = config.tools || [];
        this.parameters = config.parameters || {
            type: 'object',
            properties: {
                input: { type: 'string', description: 'エージェントへの入力メッセージ' }
            },
            required: ['input']
        };
    }

    /**
     * ツールとして実行された場合の処理
     */
    async execute(args: any): Promise<any> {
        const input = typeof args === 'string' ? args : (args.input || JSON.stringify(args));
        const result = await this.chat(input);
        return typeof result.content === 'string' ? result.content : JSON.stringify(result.content);
    }

    /**
     * エージェントと対話します
     */
    async chat(message: string): Promise<AiMessage> {
        const userMsg: AiMessage = {
            id: (crypto as any).randomUUID?.() || Math.random().toString(36).substring(2),
            role: 'user',
            content: message,
            timestamp: Date.now()
        };
        this.messages.push(userMsg);

        // ドライバーを使用して応答を生成
        const responseMsg = await this.driver.generateText({
            system: this.persona,
            messages: this.messages,
            tools: this.tools,
        });

        // エージェントIDをメタデータに付与
        if (!responseMsg.metadata) responseMsg.metadata = {};
        responseMsg.metadata.agentId = this.name;

        this.messages.push(responseMsg);
        return responseMsg;
    }

    /**
     * 履歴をクリアします
     */
    clearHistory(): void {
        this.messages = [];
    }

    /**
     * 現在の履歴を取得します
     */
    getHistory(): AiMessage[] {
        return [...this.messages];
    }
}

/**
 * エージェントを作成するヘルパー関数
 */
export function createAgent(config: ConstructorParameters<typeof BaseAgent>[0]): AiAgent {
    return new BaseAgent(config);
}
