import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";

export interface ShortcutHandlers {
    onNew: () => void;
    onOpen: () => void;
    onSave: () => void;
    onSaveAs: () => void;
    onClose: () => void;
    onToggleTheme: () => void;
}

const MD_FILTERS = [
    { name: "Markdown", extensions: ["md", "markdown"] },
];

/**
 * Open a .md file via native dialog, returns { path, content } or null
 */
export async function openFileDialog(): Promise<{
    path: string;
    content: string;
} | null> {
    const selected = await open({
        multiple: false,
        filters: MD_FILTERS,
    });

    if (!selected) return null;

    const path = typeof selected === "string" ? selected : selected;
    const content: string = await invoke("read_file", { path });
    return { path, content };
}

/**
 * Create a new .md file — opens a save dialog, writes an empty file
 */
export async function createNewFile(): Promise<string | null> {
    const path = await save({
        filters: MD_FILTERS,
        defaultPath: "untitled.md",
    });

    if (!path) return null;

    await invoke("save_file", { path, content: "" });
    return path;
}

/**
 * Save As — pick a new destination for existing content
 */
export async function saveFileAs(
    content: string,
    currentName?: string,
): Promise<string | null> {
    const path = await save({
        filters: MD_FILTERS,
        defaultPath: currentName || "untitled.md",
    });

    if (!path) return null;

    await invoke("save_file", { path, content });
    return path;
}

/**
 * Save content to a file path via Rust async I/O
 */
export async function saveFile(path: string, content: string): Promise<void> {
    await invoke("save_file", { path, content });
}

/**
 * Rename a file on disk and return the new full path
 */
export async function renameFile(
    oldPath: string,
    newName: string,
): Promise<string> {
    const parts = oldPath.split("/");
    parts[parts.length - 1] = newName;
    const newPath = parts.join("/");

    await invoke("rename_file", { oldPath, newPath });
    return newPath;
}

/**
 * Read a file by path (for opening recent files)
 */
export async function readFile(path: string): Promise<string> {
    return invoke("read_file", { path });
}

/**
 * Update native recent menu
 */
export async function updateRecentMenu(paths: string[], names: string[]): Promise<void> {
    await invoke("update_recent_menu", { paths, names });
}

// --- Shadow Save / Crash Recovery ---

export interface ShadowRecovery {
    original_path: string;
    shadow_content: string;
    shadow_modified: number;
}

/**
 * Write content to shadow buffer (atomic, async)
 */
export async function shadowSave(path: string, content: string): Promise<void> {
    await invoke("shadow_save", { path, content });
}

/**
 * Check if a shadow recovery file exists on startup
 */
export async function checkShadowRecovery(): Promise<ShadowRecovery | null> {
    return invoke("check_shadow_recovery");
}

/**
 * Restore shadow buffer to the target file and return the content
 */
export async function restoreShadow(targetPath: string): Promise<string> {
    return invoke("restore_shadow", { targetPath });
}

/**
 * Dismiss shadow recovery without restoring
 */
export async function dismissShadow(): Promise<void> {
    await invoke("dismiss_shadow");
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
 * Cmd/Ctrl + N: New file
 * Cmd/Ctrl + O: Open file
 * Cmd/Ctrl + S: Save
 * Cmd/Ctrl + Shift + S: Save As
 * Cmd/Ctrl + W: Close
 * Cmd/Ctrl + D: Toggle dark/light theme
 */
export function setupShortcuts(handlers: ShortcutHandlers): () => void {
    const handleKeydown = (e: KeyboardEvent) => {
        const mod = e.metaKey || e.ctrlKey;
        if (!mod) return;

        switch (e.key.toLowerCase()) {
            case "n":
                e.preventDefault();
                handlers.onNew();
                break;
            case "o":
                e.preventDefault();
                handlers.onOpen();
                break;
            case "s":
                e.preventDefault();
                if (e.shiftKey) {
                    handlers.onSaveAs();
                } else {
                    handlers.onSave();
                }
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
