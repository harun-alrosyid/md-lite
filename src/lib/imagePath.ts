/**
 * Utility functions for resolving local file paths in the editor.
 */

export function getDirectory(filePath: string): string {
    if (!filePath) return "";
    const parts = filePath.split('/');
    parts.pop();
    return parts.join('/');
}

export function resolveLocalPath(baseDir: string, relativePath: string): string {
    if (!baseDir || !relativePath) return relativePath;

    // If it's already an absolute or network path, ignore it
    if (relativePath.startsWith('http://') ||
        relativePath.startsWith('https://') ||
        relativePath.startsWith('data:') ||
        relativePath.startsWith('/')) {
        return relativePath;
    }

    const baseParts = baseDir.split('/').filter(Boolean);
    const relParts = relativePath.split('/').filter(Boolean);

    for (const part of relParts) {
        if (part === '.') {
            continue;
        } else if (part === '..') {
            baseParts.pop();
        } else {
            baseParts.push(part);
        }
    }

    return '/' + baseParts.join('/');
}
