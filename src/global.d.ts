declare module 'mammoth/mammoth.browser' {
    export function extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<{ value: string, messages: any[] }>;
    export function convertToHtml(input: { arrayBuffer: ArrayBuffer }, options?: any): Promise<{ value: string, messages: any[] }>;
}

declare module 'turndown' {
    export default class TurndownService {
        constructor(options?: any);
        turndown(html: string): string;
    }
}
