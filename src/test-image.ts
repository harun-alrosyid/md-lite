import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Image from '@tiptap/extension-image';
import { Markdown } from 'tiptap-markdown';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window as any;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;

const editor = new Editor({
    extensions: [
        Document,
        Paragraph,
        Text,
        Image,
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

console.log("HTML Output:", editor.getHTML());
console.log("Markdown Output:", editor.storage.markdown.getMarkdown());
