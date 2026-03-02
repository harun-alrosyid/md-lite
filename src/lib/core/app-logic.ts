import { saveFile } from "./shortcuts";
// @ts-ignore
import { fileState } from "../stores/file.svelte.ts";
// @ts-ignore
import { uiState } from "../stores/ui.svelte.ts";

export function deriveFileName(filePath: string): string {
    return filePath ? filePath.split("/").pop() || "Untitled" : "Untitled";
}

export function toggleTheme(): void {
    uiState.theme = uiState.theme === "dark" ? "light" : "dark";
}

export async function performSave(): Promise<void> {
    if (!fileState.filePath || !fileState.isDirty) return;

    fileState.isSaving = true;
    try {
        await saveFile(fileState.filePath, fileState.content);
        fileState.isDirty = false;
        fileState.isSaving = false;
    } catch (err) {
        console.error("Save failed:", err);
        fileState.isSaving = false;
    }
}

export function handleContentUpdate(markdown: string): void {
    fileState.content = markdown;
    fileState.isDirty = true;
}

export function scheduleAutoSave(
    doSave: () => Promise<void>,
    delay: number = 1000,
): void {
    if (fileState.saveTimer) clearTimeout(fileState.saveTimer);
    if (!fileState.filePath) return;

    fileState.saveTimer = setTimeout(doSave, delay);
}

/**
 * Schedule a shadow save with a 3-second debounce.
 * Uses a separate timer from the main auto-save.
 */
export function scheduleShadowSave(
    doShadow: () => Promise<void>,
    delay: number = 3000,
): void {
    if (fileState.shadowTimer) clearTimeout(fileState.shadowTimer);
    if (!fileState.filePath) return;

    fileState.shadowTimer = setTimeout(doShadow, delay);
}

// --- Recent files (localStorage) ---

const RECENT_KEY = "md-lite-recent";
const MAX_RECENT = 10;

export interface RecentFile {
    path: string;
    name: string;
    folder: string;
    openedAt: number;
}

function parseRecentEntry(path: string, openedAt: number): RecentFile {
    const parts = path.split("/");
    const name = parts.pop() || "Untitled";
    const folder = parts.slice(-2).join("/") || "/";
    return { path, name, folder, openedAt };
}

export function getRecentFiles(): RecentFile[] {
    try {
        const raw = localStorage.getItem(RECENT_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as RecentFile[];
    } catch {
        return [];
    }
}

export function addRecentFile(filePath: string): void {
    const existing = getRecentFiles().filter((r) => r.path !== filePath);
    const entry = parseRecentEntry(filePath, Date.now());
    const updated = [entry, ...existing].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
}

export function removeRecentFile(filePath: string): void {
    const updated = getRecentFiles().filter((r) => r.path !== filePath);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
}
