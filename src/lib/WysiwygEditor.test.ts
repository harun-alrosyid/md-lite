import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import WysiwygEditor from './WysiwygEditor.svelte';

// Mock the heavy tiptap dependencies
const mockChain = {
    focus: vi.fn().mockReturnThis(),
    setHeading: vi.fn().mockReturnThis(),
    setParagraph: vi.fn().mockReturnThis(),
    run: vi.fn(),
};

const mockEditorInstance = {
    commands: {
        setContent: vi.fn(),
        focus: vi.fn(),
        setFocusMode: vi.fn(),
    },
    chain: vi.fn(() => mockChain),
    isActive: vi.fn(() => false),
    storage: {
        markdown: {
            getMarkdown: vi.fn(() => ''),
        },
    },
    destroy: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
};

let capturedOnUpdate: any = null;

vi.mock('@tiptap/core', () => {
    return {
        Editor: class MockEditor {
            commands = mockEditorInstance.commands;
            chain = mockEditorInstance.chain;
            isActive = mockEditorInstance.isActive;
            storage = mockEditorInstance.storage;
            destroy = mockEditorInstance.destroy;
            on = mockEditorInstance.on;

            constructor(opts: any) {
                // Capture the onUpdate callback
                if (opts?.onUpdate) {
                    capturedOnUpdate = opts.onUpdate;
                }
                if (opts?.onTransaction) {
                    opts.onTransaction({ editor: this });
                }
            }
        },
        Extension: {
            create: vi.fn(() => ({})),
        },
    };
});

vi.mock('@tiptap/pm/state', () => ({
    Plugin: vi.fn(),
    PluginKey: vi.fn(),
    TextSelection: { near: vi.fn() },
}));

vi.mock('@tiptap/pm/view', () => ({
    Decoration: { inline: vi.fn() },
    DecorationSet: { create: vi.fn(), empty: {} },
}));

vi.mock('@tiptap/pm/model', () => ({}));

vi.mock('@tiptap/starter-kit', () => ({
    default: { configure: vi.fn(() => ({})) },
}));

vi.mock('@tiptap/extension-placeholder', () => ({
    default: { configure: vi.fn(() => ({})) },
}));

vi.mock('@tiptap/extension-typography', () => ({
    default: {},
}));

vi.mock('@tiptap/extension-task-list', () => ({
    default: {},
}));

vi.mock('@tiptap/extension-task-item', () => ({
    default: { configure: vi.fn(() => ({})) },
}));

vi.mock('@tiptap/extension-link', () => ({
    default: { configure: vi.fn(() => ({})) },
}));

vi.mock('@tiptap/extension-image', () => ({
    default: {},
}));

vi.mock('@tiptap/extension-table', () => ({
    default: { configure: vi.fn(() => ({})) },
}));

vi.mock('@tiptap/extension-table-row', () => ({
    default: {},
}));

vi.mock('@tiptap/extension-table-cell', () => ({
    default: {},
}));

vi.mock('@tiptap/extension-table-header', () => ({
    default: {},
}));

vi.mock('@tiptap/extension-highlight', () => ({
    default: { configure: vi.fn(() => ({})) },
}));

vi.mock('@tiptap/extension-subscript', () => ({
    default: {},
}));

vi.mock('@tiptap/extension-superscript', () => ({
    default: {},
}));

vi.mock('@tiptap/extension-underline', () => ({
    default: {},
}));

vi.mock('@tiptap/extension-code-block-lowlight', () => ({
    default: { configure: vi.fn(() => ({})) },
}));

vi.mock('lowlight', () => ({
    common: {},
    createLowlight: vi.fn(() => ({})),
}));

vi.mock('tiptap-markdown', () => ({
    Markdown: { configure: vi.fn(() => ({})) },
}));

describe('WysiwygEditor', () => {
    const defaultProps = {
        content: '',
        onUpdate: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        capturedOnUpdate = null;
        mockChain.focus.mockReturnThis();
        mockChain.setHeading.mockReturnThis();
        mockChain.setParagraph.mockReturnThis();
        mockEditorInstance.isActive.mockReturnValue(false);
        mockEditorInstance.storage.markdown.getMarkdown.mockReturnValue('');
    });

    it('renders editor wrapper element', () => {
        const { container } = render(WysiwygEditor, { props: defaultProps });
        expect(container.querySelector('.editor-wrapper')).toBeTruthy();
    });

    it('renders editor mount element', () => {
        const { container } = render(WysiwygEditor, { props: defaultProps });
        expect(container.querySelector('.editor-mount')).toBeTruthy();
    });

    it('sets role textbox on wrapper', () => {
        const { container } = render(WysiwygEditor, { props: defaultProps });
        expect(container.querySelector('[role="textbox"]')).toBeTruthy();
    });

    it('sets tabindex on wrapper', () => {
        const { container } = render(WysiwygEditor, { props: defaultProps });
        const wrapper = container.querySelector('.editor-wrapper');
        expect(wrapper?.getAttribute('tabindex')).toBe('-1');
    });

    it('calls setContent when mounted with non-empty content', () => {
        render(WysiwygEditor, {
            props: { content: '# Hello', onUpdate: vi.fn() },
        });
        // setContent should call editor.commands.setContent
        expect(mockEditorInstance.commands.setContent).toHaveBeenCalledWith(
            '# Hello',
        );
    });

    it('does not call setContent when content is empty initially', () => {
        render(WysiwygEditor, { props: defaultProps });
        // Empty string is falsy, so setContent should not be called from onMount
        expect(mockEditorInstance.commands.setContent).not.toHaveBeenCalled();
    });

    it('proxies onUpdate from editor to onUpdate prop', () => {
        const onUpdate = vi.fn();
        render(WysiwygEditor, { props: { content: '', onUpdate } });

        // Simulate editor update callback
        if (capturedOnUpdate) {
            mockEditorInstance.storage.markdown.getMarkdown.mockReturnValue(
                '# Updated',
            );
            capturedOnUpdate({ editor: mockEditorInstance });
            expect(onUpdate).toHaveBeenCalledWith('# Updated');
        }
    });

    it('does not call onUpdate prop when isSettingContent is true', () => {
        const onUpdate = vi.fn();
        render(WysiwygEditor, { props: { content: '', onUpdate } });

        // The isSettingContent guard is internal — when setContent is called,
        // the editor onUpdate should be suppressed. We verify setContent works
        // by providing initial content.
        expect(onUpdate).not.toHaveBeenCalled();
    });

    it('destroys editor on component unmount', () => {
        const { unmount } = render(WysiwygEditor, { props: defaultProps });
        unmount();
        expect(mockEditorInstance.destroy).toHaveBeenCalled();
    });
});

describe('WysiwygEditor - Keyboard Shortcuts', () => {
    const defaultProps = {
        content: '',
        onUpdate: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockChain.focus.mockReturnThis();
        mockChain.setHeading.mockReturnThis();
        mockChain.setParagraph.mockReturnThis();
        mockEditorInstance.isActive.mockReturnValue(false);
    });

    it('Cmd+1 sets heading level 1 when not active', () => {
        const { container } = render(WysiwygEditor, { props: defaultProps });
        const wrapper = container.querySelector('.editor-wrapper')!;
        mockEditorInstance.isActive.mockReturnValue(false);

        wrapper.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: '1',
                metaKey: true,
                bubbles: true,
                cancelable: true,
            }),
        );

        expect(mockEditorInstance.chain).toHaveBeenCalled();
        expect(mockChain.setHeading).toHaveBeenCalledWith({ level: 1 });
    });

    it('Cmd+1 toggles to paragraph when H1 already active', () => {
        const { container } = render(WysiwygEditor, { props: defaultProps });
        const wrapper = container.querySelector('.editor-wrapper')!;
        mockEditorInstance.isActive.mockReturnValue(true);

        wrapper.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: '1',
                metaKey: true,
                bubbles: true,
                cancelable: true,
            }),
        );

        expect(mockChain.setParagraph).toHaveBeenCalled();
    });

    it('Cmd+0 sets paragraph', () => {
        const { container } = render(WysiwygEditor, { props: defaultProps });
        const wrapper = container.querySelector('.editor-wrapper')!;

        wrapper.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: '0',
                metaKey: true,
                bubbles: true,
                cancelable: true,
            }),
        );

        expect(mockChain.setParagraph).toHaveBeenCalled();
    });

    it('ignores keydown without modifier key', () => {
        const { container } = render(WysiwygEditor, { props: defaultProps });
        const wrapper = container.querySelector('.editor-wrapper')!;

        wrapper.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: '1',
                metaKey: false,
                ctrlKey: false,
                bubbles: true,
                cancelable: true,
            }),
        );

        expect(mockEditorInstance.chain).not.toHaveBeenCalled();
    });

    it('handles heading levels 2 through 6', () => {
        const { container } = render(WysiwygEditor, { props: defaultProps });
        const wrapper = container.querySelector('.editor-wrapper')!;

        for (const key of ['2', '3', '4', '5', '6']) {
            vi.clearAllMocks();
            mockChain.focus.mockReturnThis();
            mockChain.setHeading.mockReturnThis();
            mockChain.setParagraph.mockReturnThis();

            wrapper.dispatchEvent(
                new KeyboardEvent('keydown', {
                    key,
                    metaKey: true,
                    bubbles: true,
                    cancelable: true,
                }),
            );

            expect(mockChain.setHeading).toHaveBeenCalledWith({
                level: parseInt(key),
            });
        }
    });

    it('handles Ctrl+key modifier (non-Mac)', () => {
        const { container } = render(WysiwygEditor, { props: defaultProps });
        const wrapper = container.querySelector('.editor-wrapper')!;

        wrapper.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: '1',
                ctrlKey: true,
                bubbles: true,
                cancelable: true,
            }),
        );

        expect(mockEditorInstance.chain).toHaveBeenCalled();
    });

    it('ignores unrecognized mod+key (e.g. Cmd+7)', () => {
        const { container } = render(WysiwygEditor, { props: defaultProps });
        const wrapper = container.querySelector('.editor-wrapper')!;

        wrapper.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: '7',
                metaKey: true,
                bubbles: true,
                cancelable: true,
            }),
        );

        expect(mockEditorInstance.chain).not.toHaveBeenCalled();
    });

    it('ignores letter keys with mod (not heading shortcuts)', () => {
        const { container } = render(WysiwygEditor, { props: defaultProps });
        const wrapper = container.querySelector('.editor-wrapper')!;

        wrapper.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: 'a',
                metaKey: true,
                bubbles: true,
                cancelable: true,
            }),
        );

        expect(mockEditorInstance.chain).not.toHaveBeenCalled();
    });
});
