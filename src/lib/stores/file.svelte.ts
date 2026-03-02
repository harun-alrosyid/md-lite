import type { ShadowRecovery } from "../core/shortcuts";
import type { RecentFile } from "../core/app-logic";

export const fileState = $state({
    content: "",
    filePath: "",
    isDirty: false,
    isSaving: false,
    saveTimer: null as ReturnType<typeof setTimeout> | null,
    shadowTimer: null as ReturnType<typeof setTimeout> | null,
    recentFiles: [] as RecentFile[],
    recoveryData: null as ShadowRecovery | null,
});
