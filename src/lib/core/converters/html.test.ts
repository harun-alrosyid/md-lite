import { describe, it, expect } from "vitest";
import { wrapInHtmlSkeleton, htmlToMarkdown } from "./html";

describe("HTML Converter", () => {
    describe("wrapInHtmlSkeleton", () => {
        it("should wrap content within a valid HTML5 skeleton", () => {
            const body = "<p>Hello World</p>";
            const result = wrapInHtmlSkeleton(body, "Test Title");
            
            expect(result).toContain("<!DOCTYPE html>");
            expect(result).toContain("<html lang=\"en\">");
            expect(result).toContain("<title>Test Title</title>");
            expect(result).toContain(body);
        });

        it("should use a default title if none is provided", () => {
            const result = wrapInHtmlSkeleton("<p>Content</p>");
            expect(result).toContain("<title>Document</title>");
        });
    });

    describe("htmlToMarkdown", () => {
        it("should convert simple HTML to Markdown", () => {
            const html = "<h1>Heading 1</h1><p>This is a <strong>bold</strong> text with a <a href=\"https://example.com\">link</a>.</p>";
            const result = htmlToMarkdown(html);
            
            expect(result).toContain("# Heading 1");
            expect(result).toContain("This is a **bold** text with a [link](https://example.com).");
        });

        it("should handle code blocks", () => {
            const html = "<pre><code>const a = 1;</code></pre>";
            const result = htmlToMarkdown(html);
            expect(result).toContain("```\nconst a = 1;\n```");
        });
    });
});
