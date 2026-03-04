import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    exportDocument,
    importDocument,
    exportWithDialog,
    importWithDialog,
} from "./converter";
import { writeTextFile, writeFile, readTextFile, readFile } from "@tauri-apps/plugin-fs";
import { save, open } from "@tauri-apps/plugin-dialog";

vi.mock("@tauri-apps/api/core", () => ({
    invoke: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
    writeTextFile: vi.fn(),
    writeFile: vi.fn(),
    readTextFile: vi.fn(),
    readFile: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-dialog", () => ({
    save: vi.fn(),
    open: vi.fn(),
}));

// We must mock the env to say we are in Tauri, otherwise it throws immediately
vi.mock("./env", () => ({
    isTauri: true,
}));

describe("Core Converters Wrapper", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(writeTextFile).mockResolvedValue(undefined);
        vi.mocked(writeFile).mockResolvedValue(undefined);
        vi.mocked(readTextFile).mockResolvedValue("");
        vi.mocked(readFile).mockResolvedValue(new Uint8Array(0));
    });

    describe("exportDocument", () => {
        it("should refuse to export PDF directly", async () => {
            await expect(exportDocument("test", "/test.pdf", "pdf")).rejects.toThrow(/PDF export is handled/);
        });

        it("should handle HTML export natively", async () => {
            await exportDocument("content", "/out.html", "html", "<p>content</p>");
            expect(writeTextFile).toHaveBeenCalledWith("/out.html", expect.stringContaining("<p>content</p>"));
        });

        it("should provide fallback for HTML export if htmlContent is omit", async () => {
            await exportDocument("hello", "/out.html", "html");
            expect(writeTextFile).toHaveBeenCalledWith("/out.html", expect.stringContaining("<pre>hello</pre>"));
        });

        it("should handle LaTeX export natively", async () => {
            await exportDocument("# test", "/out.tex", "latex");
            expect(writeTextFile).toHaveBeenCalledWith("/out.tex", expect.stringContaining("\\section{test}"));
        });

        it("should handle MediaWiki export natively", async () => {
            await exportDocument("# test", "/out.wiki", "mediawiki");
            expect(writeTextFile).toHaveBeenCalledWith("/out.wiki", expect.stringContaining("= test ="));
        });

        it("should handle DOCX export natively", async () => {
            await exportDocument("# docx", "/out.docx", "docx");
            expect(writeFile).toHaveBeenCalled();
        });

        it("should throw error for unhandled formats", async () => {
            await expect(exportDocument("test", "/out.epub", "epub" as any)).rejects.toThrow();
        });

        it("should wrap fs errors", async () => {
            vi.mocked(writeTextFile).mockRejectedValue(new Error("EACCES"));
            await expect(exportDocument("test", "/out.wiki", "mediawiki")).rejects.toThrow(/Failed to export MEDIAWIKI: EACCES/);
        });
    });

    describe("importDocument", () => {
        it("should handle HTML import natively", async () => {
            vi.mocked(readTextFile).mockResolvedValue("<h1>Test HTML</h1>");
            const md = await importDocument("/in.html", "html");
            expect(readTextFile).toHaveBeenCalledWith("/in.html");
            expect(md).toContain("# Test HTML");
        });

        it("should handle DOCX import natively", async () => {
            vi.mocked(readFile).mockResolvedValue(new Uint8Array(2));
            // Provide a mock for docxToMarkdown in docx.ts
            const docxLib = await import("./converters/docx");
            vi.spyOn(docxLib, "docxToMarkdown").mockResolvedValue("# Docx test");

            const md = await importDocument("/in.docx", "docx");
            expect(readFile).toHaveBeenCalledWith("/in.docx");
            expect(md).toBe("# Docx test");
        });

        it("should throw error for unhandled formats", async () => {
            await expect(importDocument("/in.epub", "epub" as any)).rejects.toThrow();
        });

        it("should wrap fs errors", async () => {
            vi.mocked(readTextFile).mockRejectedValue("Not found");
            await expect(importDocument("/missing.html", "html")).rejects.toThrow(/Failed to import HTML: Not found/);
        });
    });

    describe("exportWithDialog", () => {
        it("should throw for invalid format option", async () => {
            await expect(exportWithDialog("test", "epub" as any)).rejects.toThrow(/Unknown format/);
        });

        it("should open save dialog and trigger an export", async () => {
            vi.mocked(save).mockResolvedValue("/some/path/file.tex");
            
            const result = await exportWithDialog("# Title", "latex", "file");
            expect(save).toHaveBeenCalledWith(expect.objectContaining({ defaultPath: "file.tex" }));
            expect(result).toBe("/some/path/file.tex");
            // Check that writeTextFile was implicitly called because exportDocument ran
            expect(writeTextFile).toHaveBeenCalledWith("/some/path/file.tex", expect.stringContaining("\\section{Title}"));
        });

        it("should handle PDF format and skip standard file saving", async () => {
            // Mock window object
            const printSpy = vi.fn();
            vi.stubGlobal("window", { print: printSpy });

            const result = await exportWithDialog("# Title", "pdf", "file");
            
            expect(save).not.toHaveBeenCalled();
            expect(result).toBe("pdf-printed");

            // We can't easily wait for the setTimeout here without vitest timers, 
            // but we can trust the return string behavior.
            vi.unstubAllGlobals();
        });

        it("should handle user cancellation of save dialog", async () => {
            vi.mocked(save).mockResolvedValue(null);
            const result = await exportWithDialog("T", "html");
            expect(result).toBeNull();
        });
    });

    describe("importWithDialog", () => {
        it("should throw for invalid format option", async () => {
            await expect(importWithDialog("epub" as any)).rejects.toThrow(/Unknown format/);
        });

        it("should open file dialog and trigger an import", async () => {
            vi.mocked(open).mockResolvedValue("/fake/import.html");
            vi.mocked(readTextFile).mockResolvedValue("<p>Fake content</p>");
            
            const result = await importWithDialog("html");
            expect(open).toHaveBeenCalled();
            expect(readTextFile).toHaveBeenCalledWith("/fake/import.html");
            expect(result?.content).toBe("Fake content");
            expect(result?.path).toBe("/fake/import.html");
        });

        it("should return null if user cancels choice", async () => {
            vi.mocked(open).mockResolvedValue(null);
            const result = await importWithDialog("html");
            expect(result).toBeNull();
        });
    });
});
