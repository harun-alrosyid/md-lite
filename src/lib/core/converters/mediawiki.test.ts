import { describe, it, expect } from "vitest";
import { markdownToMediaWiki } from "./mediawiki";

describe("MediaWiki Converter", () => {
    it("should parse headings correctly", () => {
        const md = "# Heading 1\n## Heading 2\n### Heading 3";
        const result = markdownToMediaWiki(md);

        expect(result).toContain("= Heading 1 =");
        expect(result).toContain("== Heading 2 ==");
        expect(result).toContain("=== Heading 3 ===");
    });

    it("should parse simple unordered lists correctly", () => {
        const md = "- Item 1\n* Item 2\n+ Item 3";
        const result = markdownToMediaWiki(md);

        expect(result).toContain("* Item 1\n* Item 2\n* Item 3");
    });

    it("should parse ordered lists correctly", () => {
        const md = "1. First\n2. Second";
        const result = markdownToMediaWiki(md);

        expect(result).toContain("# First\n# Second");
    });

    it("should apply inline formatting", () => {
        const md = "Normal **bold** and *italic*";
        const result = markdownToMediaWiki(md);

        expect(result).toContain("Normal '''bold''' and ''italic''");
    });

    it("should handle links", () => {
        const md = "A [link here](https://test.com) to click";
        const result = markdownToMediaWiki(md);

        expect(result).toContain("[https://test.com link here]");
    });

    it("should handle code blocks", () => {
        const md = "```\nlet a = 1;\n```";
        const result = markdownToMediaWiki(md);

        expect(result).toContain("<source>\nlet a = 1;\n</source>\n");
    });
});
