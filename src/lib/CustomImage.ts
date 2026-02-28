import Image from '@tiptap/extension-image';
import { convertFileSrc } from '@tauri-apps/api/core';
import { resolveLocalPath, getDirectory } from './imagePath';
import { isTauri } from './env';

export interface CustomImageOptions {
    currentFilePath: () => string;
}

export const CustomImage = Image.extend<CustomImageOptions>({
    addOptions() {
        return {
            ...this.parent?.(),
            currentFilePath: () => "",
        };
    },

    renderHTML({ HTMLAttributes }) {
        const src = HTMLAttributes.src as string;
        let finalSrc = src;

        if (src && isTauri) {
            // Check if it's a local/relative path
            if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('data:') && !src.startsWith('asset://')) {
                const currentFile = this.options.currentFilePath();
                if (currentFile) {
                    const baseDir = getDirectory(currentFile);
                    const absolutePath = resolveLocalPath(baseDir, src);
                    try {
                        // Use Tauri's convertFileSrc to transform absolute local path to asset:// URI
                        finalSrc = convertFileSrc(absolutePath);
                    } catch (e) {
                        console.error("Failed to convert file src:", e);
                    }
                }
            }
        }

        return ['img', { ...HTMLAttributes, src: finalSrc }];
    },
});
