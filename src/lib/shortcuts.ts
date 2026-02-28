import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { isTauri } from "./env";

export interface ShortcutHandlers {
    onNew: () => void;
    onOpen: () => void;
    onSave: () => void;
    onSaveAs: () => void;
    onClose: () => void;
    onToggleTheme: () => void;
    onFind: () => void;
    onToggleFocusMode: () => void;
    onCommandPalette: () => void;
    onGoHome: () => void;
    onToggleOutline: () => void;
    onSetHeading1?: () => void;
    onSetHeading2?: () => void;
    onSetHeading3?: () => void;
    onSetHeading4?: () => void;
    onSetHeading5?: () => void;
    onSetHeading6?: () => void;
    onSetParagraph?: () => void;
    onToggleBold?: () => void;
    onToggleItalic?: () => void;
    onToggleStrikethrough?: () => void;
    onToggleHighlight?: () => void;
    onToggleBlockquote?: () => void;
    onToggleBulletList?: () => void;
    onToggleOrderedList?: () => void;
    onToggleCodeBlock?: () => void;
    onInsertHorizontalRule?: () => void;
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
    if (!isTauri) {
        return new Promise((resolve) => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".md,.markdown";
            input.onchange = async (e: Event) => {
                const target = e.target as HTMLInputElement;
                const file = target.files?.[0];
                if (!file) return resolve(null);

                const content = await file.text();
                // Assign a virtual path so recent files/save can track it somewhat
                const path = `web-import:${file.name}`;
                return resolve({ path, content });
            };
            input.oncancel = () => resolve(null);
            input.click();
        });
    }

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
    if (!isTauri) {
        const path = `web:${Date.now()}-untitled.md`;
        localStorage.setItem(`md-lite-file-${path}`, "");
        return path;
    }

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
    if (!isTauri) {
        // Trigger browser download
        const blob = new Blob([content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        let filename = currentName || "untitled.md";
        // Clean up virtual paths for the downloaded file name
        if (filename.startsWith("web:") || filename.startsWith("web-import:")) {
            filename = filename.split(":").pop() || "untitled.md";
        }

        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        // Save to local storage as well to mark as "saved" internally
        const path = `web:${filename}`;
        localStorage.setItem(`md-lite-file-${path}`, content);
        return path;
    }

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
    if (!isTauri) {
        localStorage.setItem(`md-lite-file-${path}`, content);
        return;
    }
    await invoke("save_file", { path, content });
}

/**
 * Rename a file on disk and return the new full path
 */
export async function renameFile(
    oldPath: string,
    newName: string,
): Promise<string> {
    if (!isTauri) {
        const content = localStorage.getItem(`md-lite-file-${oldPath}`) || "";
        const newPath = `web:${newName}`;
        localStorage.setItem(`md-lite-file-${newPath}`, content);
        localStorage.removeItem(`md-lite-file-${oldPath}`);
        return newPath;
    }

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
    if (!isTauri) {
        return localStorage.getItem(`md-lite-file-${path}`) || "";
    }
    return invoke("read_file", { path });
}

/**
 * Update native recent menu
 */
export async function updateRecentMenu(paths: string[], names: string[]): Promise<void> {
    if (!isTauri) return; // No native menu on web
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
    if (!isTauri) {
        localStorage.setItem("md-lite-shadow-recovery", JSON.stringify({
            original_path: path,
            shadow_content: content,
            shadow_modified: Date.now() / 1000,
        }));
        return;
    }
    await invoke("shadow_save", { path, content });
}

/**
 * Check if a shadow recovery file exists on startup
 */
export async function checkShadowRecovery(): Promise<ShadowRecovery | null> {
    if (!isTauri) {
        try {
            const data = localStorage.getItem("md-lite-shadow-recovery");
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    }
    return invoke("check_shadow_recovery");
}

/**
 * Restore shadow buffer to the target file and return the content
 */
export async function restoreShadow(targetPath: string): Promise<string> {
    if (!isTauri) {
        const shadow = await checkShadowRecovery();
        if (shadow) {
            await saveFile(targetPath, shadow.shadow_content);
            localStorage.removeItem("md-lite-shadow-recovery");
            return shadow.shadow_content;
        }
        return readFile(targetPath);
    }
    return invoke("restore_shadow", { targetPath });
}

/**
 * Dismiss shadow recovery without restoring
 */
export async function dismissShadow(): Promise<void> {
    if (!isTauri) {
        localStorage.removeItem("md-lite-shadow-recovery");
        return;
    }
    await invoke("dismiss_shadow");
}

/**
 * Close the current window
 */
export async function closeWindow(): Promise<void> {
    if (!isTauri) {
        // Fallback or no-op on web (can't reliably close tabs via script)
        console.log("closeWindow called on web, ignoring.");
        return;
    }
    const win = getCurrentWindow();
    await win.close();
}

import { loadShortcuts, matchShortcut } from "./shortcutStore";

/**
 * Keyboard shortcuts are configurable
 */
export function setupShortcuts(handlers: ShortcutHandlers): () => void {
    const config = loadShortcuts();

    // Create a map to look up handler by config key
    const actionHandlers: Record<string, (() => void) | undefined> = {
        onNew: handlers.onNew,
        onOpen: handlers.onOpen,
        onSave: handlers.onSave,
        onSaveAs: handlers.onSaveAs,
        onClose: handlers.onClose,
        onToggleTheme: handlers.onToggleTheme,
        onFind: handlers.onFind,
        onToggleFocusMode: handlers.onToggleFocusMode,
        onCommandPalette: handlers.onCommandPalette,
        onGoHome: handlers.onGoHome,
        onToggleOutline: handlers.onToggleOutline,
        onSetHeading1: handlers.onSetHeading1,
        onSetHeading2: handlers.onSetHeading2,
        onSetHeading3: handlers.onSetHeading3,
        onSetHeading4: handlers.onSetHeading4,
        onSetHeading5: handlers.onSetHeading5,
        onSetHeading6: handlers.onSetHeading6,
        onSetParagraph: handlers.onSetParagraph,
        onToggleBold: handlers.onToggleBold,
        onToggleItalic: handlers.onToggleItalic,
        onToggleStrikethrough: handlers.onToggleStrikethrough,
        onToggleHighlight: handlers.onToggleHighlight,
        onToggleBlockquote: handlers.onToggleBlockquote,
        onToggleBulletList: handlers.onToggleBulletList,
        onToggleOrderedList: handlers.onToggleOrderedList,
        onToggleCodeBlock: handlers.onToggleCodeBlock,
        onInsertHorizontalRule: handlers.onInsertHorizontalRule,
    };
    const handleKeydown = (e: KeyboardEvent) => {
        // Iterate through all actions and see if the event matches the configured shortcut
        for (const [action, shortcut] of Object.entries(config)) {
            if (shortcut && matchShortcut(e, shortcut)) {
                e.preventDefault();
                const handler = actionHandlers[action];
                if (handler) {
                    handler();
                }
                return; // Stop matching after first success
            }
        }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
}
