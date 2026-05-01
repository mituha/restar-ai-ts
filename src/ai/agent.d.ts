import type { AiAgent, AiDriver, AiTool, GenerationOptions } from './types';
/**
 * エージェントの基本実装クラス
 */
export declare class BaseAgent implements AiAgent {
    name: string;
    description: string;
    parameters: Record<string, any>;
    persona: string;
    driver: AiDriver;
    tools: AiTool[];
    protected messages: NonNullable<GenerationOptions['messages']>;
    constructor(config: {
        name: string;
        description: string;
        persona: string;
        driver: AiDriver;
        tools?: AiTool[];
        parameters?: Record<string, any>;
    });
    /**
     * ツールとして実行された場合の処理
     */
    execute(args: any): Promise<any>;
    /**
     * エージェントと対話します
     */
    chat(message: string): Promise<string>;
    /**
     * 履歴をクリアします
     */
    clearHistory(): void;
    /**
     * 現在の履歴を取得します
     */
    getHistory(): {
        role: "user" | "assistant" | "system" | "tool";
        content: string;
        toolCallId?: string;
        toolName?: string;
    }[];
}
/**
 * エージェントを作成するヘルパー関数
 */
export declare function createAgent(config: ConstructorParameters<typeof BaseAgent>[0]): AiAgent;
