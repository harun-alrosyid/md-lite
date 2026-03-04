import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import mammoth from "mammoth/mammoth.browser";
import TurndownService from "turndown";

/**
 * Very basic Markdown to DOCX Document generator.
 * Note: For a production app, a robust parser like Marked
 * should be used to map AST to docx nodes. This handles basic
 * headers, lists, and paragraphs.
 */
export async function markdownToDocx(markdown: string): Promise<Blob> {
    const lines = markdown.split("\n");
    const children: any[] = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trimEnd();
        if (!line) continue;

        // Headings
        const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
        if (headingMatch) {
            const levelStr = headingMatch[1];
            const text = headingMatch[2];
            let headingLevel;
            switch (levelStr.length) {
                case 1: headingLevel = HeadingLevel.HEADING_1; break;
                case 2: headingLevel = HeadingLevel.HEADING_2; break;
                case 3: headingLevel = HeadingLevel.HEADING_3; break;
                case 4: headingLevel = HeadingLevel.HEADING_4; break;
                case 5: headingLevel = HeadingLevel.HEADING_5; break;
                case 6: headingLevel = HeadingLevel.HEADING_6; break;
                default: headingLevel = HeadingLevel.HEADING_1;
            }
            children.push(new Paragraph({ text, heading: headingLevel }));
            continue;
        }

        // Bullet lists
        const listMatch = line.match(/^[-*+]\s+(.*)/);
        if (listMatch) {
            children.push(new Paragraph({
                text: listMatch[1],
                bullet: { level: 0 }
            }));
            continue;
        }

        // Ordered lists
        const orderedMatch = line.match(/^\d+\.\s+(.*)/);
        if (orderedMatch) {
            children.push(new Paragraph({
                text: orderedMatch[1],
                numbering: {
                    reference: "ordered-list",
                    level: 0,
                }
            }));
            continue;
        }

        // Bold and Italic (basic single-line support)
        let hasBold = line.includes("**");
        let hasItalic = line.includes("_") || line.includes("*");
        
        // As a fallback, render the raw Markdown text as a paragraph.
        children.push(new Paragraph({
            children: [
                new TextRun(line) // simple mapping
            ]
        }));
    }

    const doc = new Document({
        creator: "MD-Lite",
        description: "Exported from MD-Lite",
        sections: [
            {
                properties: {},
                children: children,
            },
        ],
    });

    return await Packer.toBlob(doc);
}

/**
 * Converts a DOCX file buffer (Uint8Array) to Markdown
 * by extracting HTML via Mammoth, then converting HTML to MD via Turndown.
 */
export async function docxToMarkdown(arrayBuffer: ArrayBuffer): Promise<string> {
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value; // The generated HTML
    const turndownService = new TurndownService({
        headingStyle: "atx",
        codeBlockStyle: "fenced"
    });
    return turndownService.turndown(html);
}
