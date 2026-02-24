import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";

export interface ShortcutHandlers {
    onOpen: () => void;
    onSave: () => void;
    onClose: () => void;
    onToggleTheme: () => void;
}

/**
 * Open a .md file via native dialog, returns { path, content } or null
 */
export async function openFileDialog(): Promise<{
    path: string;
    content: string;
} | null> {
    const selected = await open({
        multiple: false,
        filters: [
            {
                name: "Markdown",
                extensions: ["md", "markdown", "txt"],
            },
        ],
    });

    if (!selected) return null;

    const path = typeof selected === "string" ? selected : selected;
    const content: string = await invoke("read_file", { path });
    return { path, content };
}

/**
 * Save content to a file path via Rust async I/O
 */
export async function saveFile(path: string, content: string): Promise<void> {
    await invoke("save_file", { path, content });
}

/**
 * Close the current window
 */
export async function closeWindow(): Promise<void> {
    const win = getCurrentWindow();
    await win.close();
}

/**
 * Keyboard shortcuts:
 * Cmd/Ctrl + O: Open file
 * Cmd/Ctrl + S: Save
 * Cmd/Ctrl + W: Close
 * Cmd/Ctrl + D: Toggle dark/light theme
 */
export function setupShortcuts(handlers: ShortcutHandlers): () => void {
    const handleKeydown = (e: KeyboardEvent) => {
        const mod = e.metaKey || e.ctrlKey;
        if (!mod) return;

        switch (e.key.toLowerCase()) {
            case "o":
                e.preventDefault();
                handlers.onOpen();
                break;
            case "s":
                e.preventDefault();
                handlers.onSave();
                break;
            case "w":
                e.preventDefault();
                handlers.onClose();
                break;
            case "d":
                e.preventDefault();
                handlers.onToggleTheme();
                break;
        }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
}
