import type { AiPipeline, AiTool } from './types';
/**
 * ツールを順番に実行するパイプラインの実装
 */
export declare class SequentialPipeline implements AiPipeline {
    name: string;
    description: string;
    parameters: Record<string, any>;
    steps: AiTool[];
    constructor(config: {
        name: string;
        description: string;
        steps: AiTool[];
        parameters?: Record<string, any>;
    });
    /**
     * パイプラインを実行します。
     * 各ステップの出力が次のステップの入力となります。
     */
    execute(args: any): Promise<any>;
}
/**
 * 順次実行パイプラインを作成するヘルパー関数
 */
export declare function createPipeline(config: ConstructorParameters<typeof SequentialPipeline>[0]): AiPipeline;
