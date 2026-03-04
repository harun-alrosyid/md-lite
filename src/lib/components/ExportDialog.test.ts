import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import "@testing-library/jest-dom";
import ExportDialog from "./ExportDialog.svelte";
import * as converter from "../core/converter";

// Mock the native converter wrapper
vi.mock("../core/converter", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual as any,
        exportWithDialog: vi.fn(),
    };
});

describe("ExportDialog", () => {
    it("renders nothing when visible is false", () => {
        const { container } = render(ExportDialog, {
            visible: false,
            content: "test content",
            htmlContent: "<p>test content</p>",
            currentFileName: "test.md",
            onClose: vi.fn(),
        });
        expect(screen.queryByText("Export As")).not.toBeInTheDocument();
    });

    it("renders dialog when visible is true", () => {
        render(ExportDialog, {
            visible: true,
            content: "test",
            htmlContent: "<p>test</p>",
            currentFileName: "test.md",
            onClose: vi.fn(),
        });
        
        expect(screen.getByText("Export As")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("handles export logic and shows success message", async () => {
        const onCloseMock = vi.fn();
        vi.mocked(converter.exportWithDialog).mockResolvedValue("/mock/export.pdf");
        
        render(ExportDialog, {
            visible: true,
            content: "test",
            htmlContent: "<p>test</p>",
            currentFileName: "test.md",
            onClose: onCloseMock,
        });

        // Trigger export
        const exportBtn = screen.getByRole("button", { name: "Export" });
        await fireEvent.click(exportBtn);

        expect(converter.exportWithDialog).toHaveBeenCalledWith(
            "test",
            "pdf", // Default selected format
            "test.md",
            "<p>test</p>"
        );

        // Should eventually display success message
        expect(await screen.findByText("Exported successfully!")).toBeInTheDocument();
        
        // Timeout should trigger onClose
        await new Promise(r => setTimeout(r, 1600)); // wait for 1.5s timeout
        expect(onCloseMock).toHaveBeenCalled();
    });

    it("shows error if exportWithDialog throws", async () => {
        vi.mocked(converter.exportWithDialog).mockRejectedValue(new Error("Fake failure"));
        
        render(ExportDialog, {
            visible: true,
            content: "test",
            htmlContent: "<p>test</p>",
            currentFileName: "test.md",
            onClose: vi.fn(),
        });

        // Trigger export
        const exportBtn = screen.getByRole("button", { name: "Export" });
        await fireEvent.click(exportBtn);

        expect(await screen.findByText("Fake failure")).toBeInTheDocument();
    });

    it("allows format selection", async () => {
        render(ExportDialog, {
            visible: true,
            content: "test",
            htmlContent: "<p>test</p>",
            currentFileName: "test.md",
            onClose: vi.fn(),
        });

        const docxBtn = screen.getByText(".docx").closest("button")!;
        await fireEvent.click(docxBtn);

        // Ensure the button gets selected class
        expect(docxBtn).toHaveClass("selected");
    });

    it("handles user cancellation of save dialog", async () => {
        vi.mocked(converter.exportWithDialog).mockResolvedValue(null);
        
        render(ExportDialog, {
            visible: true,
            content: "test",
            htmlContent: "<p>test</p>",
            currentFileName: "test.md",
            onClose: vi.fn(),
        });

        // Trigger export
        const exportBtn = screen.getByRole("button", { name: "Export" });
        await fireEvent.click(exportBtn);

        expect(screen.queryByText("Exported successfully!")).not.toBeInTheDocument();
    });

    it("handles backdrop click", async () => {
        const onCloseMock = vi.fn();
        render(ExportDialog, {
            visible: true,
            content: "test",
            htmlContent: "<p>test</p>",
            currentFileName: "test.md",
            onClose: onCloseMock,
        });

        const backdrop = document.getElementById("export-dialog-backdrop");
        if(backdrop) {
            // Need to mock classList check for exact test, but Svelte uses the target of the Event
            Object.defineProperty(backdrop, "classList", {
                value: { contains: (v: string) => v === "export-backdrop" }
            });
            await fireEvent.click(backdrop);
        }
        expect(onCloseMock).toHaveBeenCalled();
    });

    it("handles escape key", async () => {
        const onCloseMock = vi.fn();
        render(ExportDialog, {
            visible: true,
            content: "test",
            htmlContent: "<p>test</p>",
            currentFileName: "test.md",
            onClose: onCloseMock,
        });

        const backdrop = document.getElementById("export-dialog-backdrop")!;
        await fireEvent.keyDown(backdrop, { key: "Escape" });
        expect(onCloseMock).toHaveBeenCalled();
    });
});
