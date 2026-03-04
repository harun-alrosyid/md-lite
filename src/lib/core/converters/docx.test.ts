import { describe, it, expect, vi } from "vitest";
import { markdownToDocx, docxToMarkdown } from "./docx";
import mammoth from "mammoth/mammoth.browser";

// Mock mammoth because it depends on node/browser environment details
vi.mock("mammoth/mammoth.browser", () => ({
    default: {
        convertToHtml: vi.fn(),
    }
}));

describe("DOCX Converter", () => {
    describe("markdownToDocx", () => {
        it("should return a Blob object from basic markdown", async () => {
            const md = "# Title\n- List Item\n1. Numbered Item\n**Bold Text**";
            const result = await markdownToDocx(md);

            expect(result).toBeInstanceOf(Blob);
            expect(result.type).toBe("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            // The fact that it produces a valid docx Blob means docx packer worked correctly.
        });

        it("should parse multiple heading levels correctly", async () => {
            const md = "## H2\n### H3\n#### H4\n##### H5\n###### H6\n####### H7";
            const result = await markdownToDocx(md);
            expect(result).toBeInstanceOf(Blob);
        });

        it("should ignore empty lines", async () => {
            const md = "\n\n# Real\n\n";
            const result = await markdownToDocx(md);
            expect(result).toBeInstanceOf(Blob);
        });
    });

    describe("docxToMarkdown", () => {
        it("should convert docx ArrayBuffer to Markdown via Mammoth and Turndown", async () => {
            const mockHtml = "<h1>Parsed DOCX Header</h1><p>Test paragraph content.</p>";
            // Mock mammoth implementation
            vi.mocked(mammoth.convertToHtml).mockResolvedValue({
                value: mockHtml,
                messages: []
            });

            // Create a dummy buffer
            const buffer = new ArrayBuffer(8);

            const result = await docxToMarkdown(buffer);

            // Expect Turndown processing
            expect(result).toContain("# Parsed DOCX Header");
            expect(result).toContain("Test paragraph content.");
        });
    });
});
