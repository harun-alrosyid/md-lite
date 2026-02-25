import { saveFile } from "./shortcuts";

export interface AppState {
    content: string;
    filePath: string;
    isDirty: boolean;
    isSaving: boolean;
    theme: "dark" | "light";
    saveTimer: ReturnType<typeof setTimeout> | null;
}

export function createInitialState(): AppState {
    return {
        content: "",
        filePath: "",
        isDirty: false,
        isSaving: false,
        theme: "dark",
        saveTimer: null,
    };
}

export function deriveFileName(filePath: string): string {
    return filePath ? filePath.split("/").pop() || "Untitled" : "Untitled";
}

export function toggleTheme(state: AppState): AppState {
    const newTheme = state.theme === "dark" ? "light" : "dark";
    return { ...state, theme: newTheme };
}

export async function performSave(state: AppState): Promise<AppState> {
    if (!state.filePath || !state.isDirty) return state;

    const newState = { ...state, isSaving: true };
    try {
        await saveFile(state.filePath, state.content);
        return { ...newState, isDirty: false, isSaving: false };
    } catch (err) {
        console.error("Save failed:", err);
        return { ...newState, isSaving: false };
    }
}

export function handleContentUpdate(
    state: AppState,
    markdown: string,
): AppState {
    return { ...state, content: markdown, isDirty: true };
}

export function scheduleAutoSave(
    state: AppState,
    doSave: () => Promise<void>,
    delay: number = 1000,
): AppState {
    if (state.saveTimer) clearTimeout(state.saveTimer);
    if (!state.filePath) return state;

    const timer = setTimeout(doSave, delay);
    return { ...state, saveTimer: timer };
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
