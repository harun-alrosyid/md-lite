import { invoke } from "@tauri-apps/api/core";
import { save, open } from "@tauri-apps/plugin-dialog";
import { writeTextFile, writeFile, readTextFile, readFile } from "@tauri-apps/plugin-fs";
import { isTauri } from "./env";
import { markdownToLatex } from "./converters/latex";
import { markdownToMediaWiki } from "./converters/mediawiki";
import { markdownToDocx, docxToMarkdown } from "./converters/docx";
import { wrapInHtmlSkeleton, htmlToMarkdown } from "./converters/html";

export type ExportFormat = "pdf" | "docx" | "latex" | "mediawiki" | "html";
export type ImportFormat = "docx" | "latex" | "mediawiki" | "html";

export interface FormatOption {
    value: string;
    label: string;
    extension: string;
    description: string;
}

export const EXPORT_FORMATS: FormatOption[] = [
    { value: "pdf", label: "PDF", extension: "pdf", description: "Save as PDF" },
    { value: "docx", label: "DOCX", extension: "docx", description: "Microsoft Word" },
    { value: "html", label: "HTML", extension: "html", description: "Web page" },
    { value: "latex", label: "LaTeX", extension: "tex", description: "LaTeX source" },
    { value: "mediawiki", label: "MediaWiki", extension: "wiki", description: "Wikipedia markup" },
];

export const IMPORT_FORMATS: FormatOption[] = [
    { value: "docx", label: "DOCX", extension: "docx", description: "Microsoft Word" },
    { value: "html", label: "HTML", extension: "html", description: "Web page" },
];

/**
 * Export Markdown content to a given format natively.
 */
export async function exportDocument(
    content: string,
    outputPath: string,
    format: ExportFormat,
    htmlContent?: string,
): Promise<void> {
    if (!isTauri) {
        throw new Error("Export is only available in the desktop app.");
    }

    if (format === "pdf") {
        throw new Error("PDF export is handled via the Print dialog.");
    }
    
    try {
        if (format === "latex") {
            const latex = markdownToLatex(content);
            await writeTextFile(outputPath, latex);
        } else if (format === "mediawiki") {
            const wiki = markdownToMediaWiki(content);
            await writeTextFile(outputPath, wiki);
        } else if (format === "html") {
            // Provide fallback if htmlContent isn't passed
            const body = htmlContent || `<pre>${content}</pre>`;
            const html = wrapInHtmlSkeleton(body);
            await writeTextFile(outputPath, html);
        } else if (format === "docx") {
            const docxBlob = await markdownToDocx(content);
            const arrayBuffer = await docxBlob.arrayBuffer();
            await writeFile(outputPath, new Uint8Array(arrayBuffer));
        } else {
            throw new Error(`Exporting to ${format} is not fully implemented yet.`);
        }
    } catch (err: any) {
        throw new Error(`Failed to export ${format.toUpperCase()}: ${err.message || err}`);
    }
}

/**
 * Import a document and convert to Markdown natively.
 */
export async function importDocument(
    inputPath: string,
    format: ImportFormat,
): Promise<string> {
    if (!isTauri) {
        throw new Error("Import is only available in the desktop app.");
    }

    try {
        if (format === "html") {
            const htmlString = await readTextFile(inputPath);
            return htmlToMarkdown(htmlString);
        } else if (format === "docx") {
            const uint8Array = await readFile(inputPath);
            return await docxToMarkdown(uint8Array.buffer);
        } else {
            throw new Error(`Importing from ${format} is not fully implemented yet.`);
        }
    } catch (err: any) {
        throw new Error(`Failed to import ${format.toUpperCase()}: ${err.message || err}`);
    }
}

/**
 * Open a save dialog and export the document.
 * Returns the output path on success, null if cancelled.
 */
export async function exportWithDialog(
    content: string,
    format: ExportFormat,
    defaultName?: string,
    htmlContent?: string,
): Promise<string | null> {
    const fmt = EXPORT_FORMATS.find((f) => f.value === format);
    if (!fmt) throw new Error(`Unknown format: ${format}`);

    if (format === "pdf") {
        setTimeout(() => window.print(), 100);
        return "pdf-printed";
    }

    const baseName = defaultName
        ? defaultName.replace(/\.[^.]+$/, "")
        : "untitled";

    const outputPath = await save({
        filters: [{ name: fmt.label, extensions: [fmt.extension] }],
        defaultPath: `${baseName}.${fmt.extension}`,
    });

    if (!outputPath) return null;

    await exportDocument(content, outputPath, format, htmlContent);
    return outputPath;
}

/**
 * Open a file dialog to pick a file and import it.
 * Returns { path, content } on success, null if cancelled.
 */
export async function importWithDialog(
    format: ImportFormat,
): Promise<{ path: string; content: string } | null> {
    const fmt = IMPORT_FORMATS.find((f) => f.value === format);
    if (!fmt) throw new Error(`Unknown format: ${format}`);

    const selected = await open({
        multiple: false,
        filters: [{ name: fmt.label, extensions: [fmt.extension] }],
    });

    if (!selected) return null;

    const path = typeof selected === "string" ? selected : selected;
    const content = await importDocument(path, format);
    return { path, content };
}
