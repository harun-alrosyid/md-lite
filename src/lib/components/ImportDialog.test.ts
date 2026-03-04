import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import "@testing-library/jest-dom";
import ImportDialog from "./ImportDialog.svelte";
import * as converter from "../core/converter";

// Mock the native converter wrapper
vi.mock("../core/converter", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual as any,
        importWithDialog: vi.fn(),
    };
});

describe("ImportDialog", () => {
    it("renders nothing when visible is false", () => {
        const { container } = render(ImportDialog, {
            visible: false,
            onClose: vi.fn(),
            onImported: vi.fn()
        });
        expect(screen.queryByText("Import Document")).not.toBeInTheDocument();
    });

    it("renders dialog when visible is true", () => {
        render(ImportDialog, {
            visible: true,
            onClose: vi.fn(),
            onImported: vi.fn()
        });
        
        expect(screen.getByText("Import Document")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Choose File & Import" })).toBeInTheDocument();
    });

    it("handles successful import logic", async () => {
        const onImportedMock = vi.fn();
        const onCloseMock = vi.fn();
        
        vi.mocked(converter.importWithDialog).mockResolvedValue({
            path: "/fake/imported.docx",
            content: "# Imported content"
        });

        render(ImportDialog, {
            visible: true,
            onClose: onCloseMock,
            onImported: onImportedMock
        });

        // Select format
        const formatBtn = screen.getByText(".docx").closest("button")!;
        await fireEvent.click(formatBtn);

        // Click import
        const importBtn = screen.getByRole("button", { name: "Choose File & Import" });
        await fireEvent.click(importBtn);

        expect(converter.importWithDialog).toHaveBeenCalledWith("docx");

        // Reactivity timeout to await state propagation
        await new Promise(r => setTimeout(r, 10));

        expect(onImportedMock).toHaveBeenCalledWith("# Imported content", "/fake/imported.docx");
        expect(onCloseMock).toHaveBeenCalled();
    });

    it("handles import errors properly", async () => {
        vi.mocked(converter.importWithDialog).mockRejectedValue(new Error("Import failed"));
        
        render(ImportDialog, {
            visible: true,
            onClose: vi.fn(),
            onImported: vi.fn()
        });

        const importBtn = screen.getByRole("button", { name: "Choose File & Import" });
        await fireEvent.click(importBtn);

        expect(await screen.findByText("Import failed")).toBeInTheDocument();
    });

    it("handles null return from importWithDialog (cancellation)", async () => {
        vi.mocked(converter.importWithDialog).mockResolvedValue(null);
        
        const onImportedMock = vi.fn();
        render(ImportDialog, {
            visible: true,
            onClose: vi.fn(),
            onImported: onImportedMock
        });

        const importBtn = screen.getByRole("button", { name: "Choose File & Import" });
        await fireEvent.click(importBtn);

        expect(onImportedMock).not.toHaveBeenCalled();
    });

    it("handles backdrop click", async () => {
        const onCloseMock = vi.fn();
        render(ImportDialog, {
            visible: true,
            onClose: onCloseMock,
            onImported: vi.fn()
        });

        const backdrop = document.getElementById("import-dialog-backdrop");
        if(backdrop) {
            Object.defineProperty(backdrop, "classList", {
                value: { contains: (v: string) => v === "import-backdrop" }
            });
            await fireEvent.click(backdrop);
        }
        expect(onCloseMock).toHaveBeenCalled();
    });

    it("handles escape key", async () => {
        const onCloseMock = vi.fn();
        render(ImportDialog, {
            visible: true,
            onClose: onCloseMock,
            onImported: vi.fn()
        });

        const backdrop = document.getElementById("import-dialog-backdrop")!;
        await fireEvent.keyDown(backdrop, { key: "Escape" });
        expect(onCloseMock).toHaveBeenCalled();
    });
});
