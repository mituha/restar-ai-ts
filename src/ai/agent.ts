import type { AiAgent, AiDriver, AiTool, GenerationOptions } from './types';

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
    
    protected messages: NonNullable<GenerationOptions['messages']> = [];

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
        return this.chat(input);
    }

    /**
     * エージェントと対話します
     */
    async chat(message: string): Promise<string> {
        this.messages.push({ role: 'user', content: message });

        // ドライバーを使用して応答を生成
        // 注意: ドライバー側でツール実行をサポートする必要があります
        const response = await this.driver.generateText({
            system: this.persona,
            messages: this.messages,
            tools: this.tools,
        });

        this.messages.push({ role: 'assistant', content: response });
        return response;
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
    getHistory() {
        return [...this.messages];
    }
}

/**
 * エージェントを作成するヘルパー関数
 */
export function createAgent(config: ConstructorParameters<typeof BaseAgent>[0]): AiAgent {
    return new BaseAgent(config);
}
