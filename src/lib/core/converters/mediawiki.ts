/**
 * Very basic Markdown to MediaWiki converter using string replacement.
 * Handles headings, bold, italic, code blocks, links, and basic lists.
 */
export function markdownToMediaWiki(markdown: string): string {
    const lines = markdown.split("\n");
    let result = "";
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Code block toggle
        if (line.trim().startsWith("```")) {
            inCodeBlock = !inCodeBlock;
            if (inCodeBlock) {
                result += "<source>\n";
            } else {
                result += "</source>\n";
            }
            continue;
        }

        if (inCodeBlock) {
            result += line + "\n";
            continue;
        }

        // Headings
        const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
        if (headingMatch) {
            const level = headingMatch[1].length;
            const text = headingMatch[2];
            const eq = "=".repeat(level);
            result += `${eq} ${text} ${eq}\n`;
            continue;
        }

        // Unordered Lists
        const listMatch = line.match(/^[-*+]\s+(.*)/);
        if (listMatch) {
            result += `* ${listMatch[1]}\n`;
            continue;
        }

        // Ordered Lists
        const orderedMatch = line.match(/^\d+\.\s+(.*)/);
        if (orderedMatch) {
            result += `# ${orderedMatch[1]}\n`;
            continue;
        }

        // Inline formatting
        line = line.replace(/\*\*(.*?)\*\*/g, "'''$1'''");
        line = line.replace(/__(.*?)__/g, "'''$1'''");
        line = line.replace(/\*(.*?)\*/g, "''$1''");
        line = line.replace(/_(.*?)_/g, "''$1''");
        
        // Links: [Text](URL) -> [URL Text]
        line = line.replace(/\[(.*?)\]\((.*?)\)/g, "[$2 $1]");

        result += line + "\n";
    }

    return result;
}
