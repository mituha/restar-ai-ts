import type { AiPipeline, AiTool } from './types';

/**
 * ツールを順番に実行するパイプラインの実装
 */
export class SequentialPipeline implements AiPipeline {
    public name: string;
    public description: string;
    public parameters: Record<string, any>;
    public steps: AiTool[];

    constructor(config: {
        name: string;
        description: string;
        steps: AiTool[];
        parameters?: Record<string, any>;
    }) {
        this.name = config.name;
        this.description = config.description;
        this.steps = config.steps;
        this.parameters = config.parameters || {
            type: 'object',
            properties: {
                input: { type: 'string', description: 'パイプラインの開始入力' }
            },
            required: ['input']
        };
    }

    /**
     * パイプラインを実行します。
     * 各ステップの出力が次のステップの入力となります。
     */
    async execute(args: any): Promise<any> {
        let currentResult = args;
        
        for (const step of this.steps) {
            // ステップの実行
            // 前のステップの結果を引数として渡す
            currentResult = await step.execute(currentResult);
        }
        
        return currentResult;
    }
}

/**
 * 順次実行パイプラインを作成するヘルパー関数
 */
export function createPipeline(config: ConstructorParameters<typeof SequentialPipeline>[0]): AiPipeline {
    return new SequentialPipeline(config);
}
