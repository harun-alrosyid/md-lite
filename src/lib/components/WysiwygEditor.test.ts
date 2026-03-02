import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/svelte';
import WysiwygEditor from './WysiwygEditor.svelte';
import * as env from './env';
import * as shell from '@tauri-apps/plugin-shell';
import type { Editor } from '@tiptap/core';

// Mock Tauri env and shell
vi.mock('./env', () => ({
    isTauri: false,
}));

vi.mock('@tauri-apps/plugin-shell', () => ({
    open: vi.fn().mockResolvedValue(undefined),
}));

// Mock window.open for web environment clicks
const windowOpenMock = vi.fn();
vi.stubGlobal('open', windowOpenMock);

describe('WysiwygEditor.svelte', () => {
    let onUpdateMock: ReturnType<typeof vi.fn>;
    let onEditorReadyMock: ReturnType<typeof vi.fn>;
    let onOutlineChangeMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        onUpdateMock = vi.fn();
        onEditorReadyMock = vi.fn();
        onOutlineChangeMock = vi.fn();
        windowOpenMock.mockClear();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders and mounts editor successfully', async () => {
        render(WysiwygEditor, {
            props: {
                content: '# Hello',
                onUpdate: onUpdateMock,
                onEditorReady: onEditorReadyMock
            }
        });

        const editorNode = document.querySelector('.wysiwyg-editor');
        expect(editorNode).not.toBeNull();
        expect(onEditorReadyMock).toHaveBeenCalled();

        // Ensure content was set
        const textContent = editorNode?.textContent;
        expect(textContent).toContain('Hello');
    });

    it('fires onUpdate when content changes', async () => {
        // We capture the editor instance to simulate a transaction
        let editorInstance: Editor | null = null;
        render(WysiwygEditor, {
            props: {
                content: '',
                onUpdate: onUpdateMock,
                onEditorReady: (e: Editor) => { editorInstance = e; }
            }
        });

        expect(editorInstance).not.toBeNull();
        if (editorInstance) {
            editorInstance.commands.insertContent('Test insertion');
            // Testing Library doesn't easily trigger Tiptap's internal MutationObservers
            // So we manually verified the command triggered the onUpdate callback natively
            expect(onUpdateMock).toHaveBeenCalled();
        }
    });

    it('handles keyboard shortcuts for headings', async () => {
        render(WysiwygEditor, {
            props: {
                content: 'Paragraph text',
                onUpdate: onUpdateMock,
            }
        });

        const wrapper = document.querySelector('.editor-wrapper') as HTMLElement;

        // Command + 2 -> Heading 2
        await fireEvent.keyDown(wrapper, { key: '2', metaKey: true });

        const editorNode = document.querySelector('.wysiwyg-editor');
        expect(editorNode?.innerHTML).toContain('<h2');

        // Command + 0 -> Paragraph
        await fireEvent.keyDown(wrapper, { key: '0', metaKey: true });
        expect(editorNode?.innerHTML).toContain('<p');
    });

    it('syncs focusMode prop dynamically', async () => {
        const { rerender } = render(WysiwygEditor, {
            props: {
                content: 'Text',
                onUpdate: onUpdateMock,
                focusMode: false
            }
        });

        const wrapper = document.querySelector('.editor-wrapper');
        expect(wrapper?.classList.contains('typewriter-mode')).toBe(false);

        // Modify prop dynamically
        await rerender({ focusMode: true });

        expect(wrapper?.classList.contains('typewriter-mode')).toBe(true);
    });

    it('intercepts clicks on links in web environment', async () => {
        // Force web env
        vi.mocked(env).isTauri = false;

        render(WysiwygEditor, {
            props: {
                content: '[Link](https://google.com)',
                onUpdate: onUpdateMock,
            }
        });

        // Tiptap might take a tick to render marks
        await new Promise(r => setTimeout(r, 50));

        const link = document.querySelector('a');
        expect(link).not.toBeNull();

        if (link) {
            await fireEvent.click(link, { metaKey: true }); // Cmd+Click
            expect(windowOpenMock).toHaveBeenCalledWith('https://google.com', '_blank');
        }
    });

    it('intercepts clicks on links in Tauri environment', async () => {
        vi.mocked(env).isTauri = true as boolean;

        render(WysiwygEditor, {
            props: {
                content: '[Link](https://google.com)',
                onUpdate: onUpdateMock,
            }
        });

        await new Promise(r => setTimeout(r, 50));

        const link = document.querySelector('a');
        if (link) {
            await fireEvent.click(link, { metaKey: true });
            expect(shell.open).toHaveBeenCalledWith('https://google.com');
        }
    });
});
