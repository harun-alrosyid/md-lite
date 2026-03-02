import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { CustomImage } from './lib/extensions/CustomImage';
import { CustomLink } from './lib/extensions/CustomLink';
import { Markdown } from 'tiptap-markdown';

describe('Markdown Image Parsing', () => {
    it('should parse an image correctly from markdown', () => {
        const editor = new Editor({
            extensions: [
                StarterKit,
                CustomLink.configure({
                    openOnClick: true,
                    autolink: true,
                }),
                CustomImage.configure({
                    currentFilePath: () => '',
                }),
                Markdown.configure({
                    html: true,
                    tightLists: true,
                    bulletListMarker: "-",
                    transformPastedText: true,
                    transformCopiedText: true,
                }),
            ],
            content: '![Project Detail](assets/pages/project-detail.jpg)',
        });

        const html = editor.getHTML();
        const md = editor.storage.markdown.getMarkdown();
        console.log("HTML:", html);
        console.log("MD:", md);

        expect(html).toContain('img');
    });
});
