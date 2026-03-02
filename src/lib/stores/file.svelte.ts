import type { ShadowRecovery } from "../shortcuts";
import type { RecentFile } from "../app-logic";

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
