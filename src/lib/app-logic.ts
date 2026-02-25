import { saveFile } from './shortcuts';

export interface AppState {
    content: string;
    filePath: string;
    isDirty: boolean;
    isSaving: boolean;
    theme: 'dark' | 'light';
    saveTimer: ReturnType<typeof setTimeout> | null;
}

/**
 * Create an initial app state
 */
export function createInitialState(): AppState {
    return {
        content: '',
        filePath: '',
        isDirty: false,
        isSaving: false,
        theme: 'dark',
        saveTimer: null,
    };
}

/**
 * Derive file name from file path
 */
export function deriveFileName(filePath: string): string {
    return filePath ? filePath.split('/').pop() || 'Untitled' : 'Untitled';
}

/**
 * Toggle theme between dark and light
 */
export function toggleTheme(state: AppState): AppState {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    return { ...state, theme: newTheme };
}

/**
 * Perform save operation
 */
export async function performSave(
    state: AppState,
): Promise<AppState> {
    if (!state.filePath || !state.isDirty) return state;

    const newState = { ...state, isSaving: true };
    try {
        await saveFile(state.filePath, state.content);
        return { ...newState, isDirty: false, isSaving: false };
    } catch (err) {
        console.error('Save failed:', err);
        return { ...newState, isSaving: false };
    }
}

/**
 * Handle content update from editor
 */
export function handleContentUpdate(
    state: AppState,
    markdown: string,
): AppState {
    return { ...state, content: markdown, isDirty: true };
}

/**
 * Schedule an auto-save with debounce
 */
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
