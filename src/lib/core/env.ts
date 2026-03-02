/**
 * Environment utility to determine if MD-Lite is running inside the Tauri desktop app
 * vs running as a standard web application.
 */
export const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
