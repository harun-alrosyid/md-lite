import { describe, it, expect } from "vitest";
import { markdownToLatex } from "./latex";

describe("LaTeX Converter", () => {
    it("should generate standard LaTeX document structure", () => {
        const md = "Hello Writer";
        const result = markdownToLatex(md);

        expect(result).toContain("\\documentclass{article}");
        expect(result).toContain("\\begin{document}");
        expect(result).toContain("Hello Writer");
        expect(result).toContain("\\end{document}");
    });

    it("should parse headings correctly", () => {
        const md = "# Title 1\n## Title 2\n### Title 3\n#### Title 4";
        const result = markdownToLatex(md);

        expect(result).toContain("\\section{Title 1}");
        expect(result).toContain("\\subsection{Title 2}");
        expect(result).toContain("\\subsubsection{Title 3}");
        expect(result).toContain("\\paragraph{Title 4}");
    });

    it("should parse basic lists correctly", () => {
        const md = "- Item A\n- Item B";
        const result = markdownToLatex(md);

        expect(result).toContain("\\begin{itemize}");
        expect(result).toContain("\\item Item A");
        expect(result).toContain("\\item Item B");
        expect(result).toMatch(/\\end\{itemize\}/);
    });

    it("should apply inline formatting", () => {
        const md = "Normal **bold** and *italic* and __bold2__ and _italic2_";
        const result = markdownToLatex(md);

        expect(result).toContain("\\textbf{bold}");
        expect(result).toContain("\\textit{italic}");
        expect(result).toContain("\\textbf{bold2}");
        expect(result).toContain("\\textit{italic2}");
    });

    it("should handle mixed sequences that open/close lists properly", () => {
        const md = "- List Item 1\n\n- List Item 2\nJust some text\n- List Item 3";
        const result = markdownToLatex(md);

        // After List Item 1, there's a blank line which turns off the list
        expect(result).toContain("\\end{itemize}\n\n\\begin{itemize}");
        // Text breaks the second list
        expect(result).toContain("Just some text");
    });

    it("should handle links", () => {
        const md = "A [link here](https://test.com) to click";
        const result = markdownToLatex(md);

        expect(result).toContain("\\href{https://test.com}{link here}");
    });

    it("should handle code blocks", () => {
        const md = "```\nlet a = 1;\n```";
        const result = markdownToLatex(md);

        expect(result).toContain("\\begin{verbatim}");
        expect(result).toContain("let a = 1;\n");
        expect(result).toContain("\\end{verbatim}");
    });
});
