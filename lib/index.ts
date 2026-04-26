export type NovelaidDocumentType = "novel" | "markdown" | "image" | "chat" | "gitDiff" | "browser" | "css" | "unknown" | "external";
export const checkType3 = (type: NovelaidDocumentType) => {
    console.log(type);
};