import TurndownService from "turndown";

/**
 * Wraps Markdown or HTML content in a basic HTML structure for export.
 */
export function wrapInHtmlSkeleton(htmlBody: string, title: string = "Document"): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; }
        pre { background: #f4f4f4; padding: 1rem; border-radius: 4px; overflow-x: auto; }
        code { font-family: ui-monospace, monospace; background: #f4f4f4; padding: 0.2rem 0.4rem; border-radius: 3px; }
        blockquote { border-left: 4px solid #ddd; margin-left: 0; padding-left: 1rem; color: #555; }
        img { max-width: 100%; height: auto; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    </style>
</head>
<body>
${htmlBody}
</body>
</html>`;
}

/**
 * Converts an HTML string (from an imported file) to Markdown.
 */
export function htmlToMarkdown(htmlString: string): string {
    const turndownService = new TurndownService({
        headingStyle: "atx",
        codeBlockStyle: "fenced"
    });
    return turndownService.turndown(htmlString);
}
