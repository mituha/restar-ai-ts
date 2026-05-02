/**
 * ファイルパスと内容のペア
 */
export interface ContextFile {
    /** ファイルパス、または識別子 */
    path: string;
    /** ファイルの本文 */
    content: string;
}

/**
 * 複数のファイルやテキスト情報を AI が理解しやすいコンテキスト形式に整形します。
 * novelaid-editor 等での利用を想定した共通形式を提供します。
 * 
 * @param files コンテキストに含めるファイルの配列
 * @returns 整形されたコンテキスト文字列
 */
export function formatContext(files: ContextFile[]): string {
    if (files.length === 0) return "";

    let result = "Context:\n\n";
    for (const file of files) {
        // パスからファイル名のみを抽出（表示用）
        const fileName = file.path.split(/[/\\]/).pop() || file.path;
        
        result += `[File: ${fileName}]\n`;
        result += "```\n";
        result += file.content;
        if (!file.content.endsWith('\n')) {
            result += "\n";
        }
        result += "```\n\n";
    }
    
    return result;
}

/**
 * プロンプトにコンテキストを埋め込みます。
 * 
 * @param prompt 元のユーザープロンプト
 * @param contextText 整形済みのコンテキスト文字列
 * @returns コンテキストが統合されたプロンプト
 */
export function wrapWithContext(prompt: string, contextText: string): string {
    if (!contextText) return prompt;
    return `${contextText}\nUser: ${prompt}`;
}
