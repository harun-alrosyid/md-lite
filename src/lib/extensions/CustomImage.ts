import Image from '@tiptap/extension-image';
import { mergeAttributes, nodeInputRule } from '@tiptap/core';
import { convertFileSrc } from '@tauri-apps/api/core';
import { resolveLocalPath, getDirectory } from '../core/imagePath';
import { isTauri } from '../core/env';

export interface CustomImageOptions {
    HTMLAttributes: Record<string, any>;
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
            console.log("[CustomImage] src:", src, "isTauri is true");

            // Check if it's a local/relative path
            if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('data:') && !src.startsWith('asset://')) {
                const currentFile = this.options.currentFilePath();
                console.log("[CustomImage] currentFile:", currentFile);
                if (currentFile) {
                    const baseDir = getDirectory(currentFile);
                    const absolutePath = resolveLocalPath(baseDir, src);
                    console.log("[CustomImage] baseDir:", baseDir, "absolutePath:", absolutePath);
                    try {
                        // Use Tauri's convertFileSrc to transform absolute local path to asset:// URI
                        finalSrc = convertFileSrc(absolutePath);
                        console.log("[CustomImage] finalSrc from Tauri:", finalSrc);
                    } catch (e) {
                        console.error("[CustomImage] Failed to convert file src:", e);
                    }
                }
            }
        } else if (src) {
            console.log("[CustomImage] isTauri is false or src is empty. src:", src);
        }

        return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { src: finalSrc })];
    },

    addInputRules() {
        return [
            nodeInputRule({
                find: /(?:^|\s)(!\[(.*?)\]\((.*?)\))\s$/,
                type: this.type,
                getAttributes: (match: any[]) => {
                    const [, , alt, src] = match;
                    return { src, alt };
                },
            }),
        ];
    },
});
