import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, within } from '@testing-library/svelte';
import FormatBar from './FormatBar.svelte';
import MarkButtons from './format-bar/MarkButtons.svelte';
import ListButtons from './format-bar/ListButtons.svelte';
import MediaButtons from './format-bar/MediaButtons.svelte';
import HeadingSelector from './format-bar/HeadingSelector.svelte';

describe('FormatBar.svelte and Subcomponents', () => {
    let mockEditor: any;
    let mockChain: any;

    beforeEach(() => {
        mockChain = {
            focus: vi.fn().mockReturnThis(),
            toggleBold: vi.fn().mockReturnThis(),
            toggleItalic: vi.fn().mockReturnThis(),
            toggleStrike: vi.fn().mockReturnThis(),
            toggleCode: vi.fn().mockReturnThis(),
            toggleOrderedList: vi.fn().mockReturnThis(),
            toggleBulletList: vi.fn().mockReturnThis(),
            toggleTaskList: vi.fn().mockReturnThis(),
            unsetLink: vi.fn().mockReturnThis(),
            insertContent: vi.fn().mockReturnThis(),
            setTextSelection: vi.fn().mockReturnThis(),
            run: vi.fn(),
        };

        mockEditor = {
            isActive: vi.fn().mockReturnValue(false),
            chain: vi.fn().mockReturnValue(mockChain),
            state: {
                selection: { from: 0, to: 0 },
                doc: {
                    textBetween: vi.fn().mockReturnValue(''),
                }
            }
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('does not render without editor', () => {
        const { container } = render(FormatBar, { props: { editor: null } });
        expect(container.querySelector('.format-bar')).toBeNull();
    });

    it('renders all categories when editor is present', () => {
        const { container } = render(FormatBar, { props: { editor: mockEditor } });
        expect(container.querySelector('.format-bar')).not.toBeNull();
        expect(screen.getByTitle('Headers')).toBeDefined();
        expect(screen.getByTitle('Bullet List')).toBeDefined();
        expect(screen.getByTitle('Link')).toBeDefined();
    });

    // --- MarkButtons ---
    describe('Marks', () => {
        it('toggles Bold', async () => {
            render(FormatBar, { props: { editor: mockEditor } });
            const btn = screen.getByTitle('Bold');
            await fireEvent.mouseDown(btn);
            await fireEvent.click(btn);
            expect(mockChain.toggleBold).toHaveBeenCalled();
            expect(mockChain.run).toHaveBeenCalled();
        });

        it('toggles Italic', async () => {
            render(FormatBar, { props: { editor: mockEditor } });
            const btn = screen.getByTitle('Italic');
            await fireEvent.mouseDown(btn);
            await fireEvent.click(btn);
            expect(mockChain.toggleItalic).toHaveBeenCalled();
            expect(mockChain.run).toHaveBeenCalled();
        });

        it('toggles Strikethrough', async () => {
            render(FormatBar, { props: { editor: mockEditor } });
            const btn = screen.getByTitle('Strikethrough');
            await fireEvent.mouseDown(btn);
            await fireEvent.click(btn);
            expect(mockChain.toggleStrike).toHaveBeenCalled();
            expect(mockChain.run).toHaveBeenCalled();
        });

        it('toggles Inline Code', async () => {
            render(FormatBar, { props: { editor: mockEditor } });
            const btn = screen.getByTitle('Inline Code');
            await fireEvent.mouseDown(btn);
            await fireEvent.click(btn);
            expect(mockChain.toggleCode).toHaveBeenCalled();
            expect(mockChain.run).toHaveBeenCalled();
        });
    });

    // --- ListButtons ---
    describe('Lists', () => {
        it('toggles Ordered List', async () => {
            render(FormatBar, { props: { editor: mockEditor } });
            const btn = screen.getByTitle('Ordered List');
            await fireEvent.mouseDown(btn);
            await fireEvent.click(btn);
            expect(mockChain.toggleOrderedList).toHaveBeenCalled();
            expect(mockChain.run).toHaveBeenCalled();
        });

        it('toggles Bullet List', async () => {
            render(FormatBar, { props: { editor: mockEditor } });
            const btn = screen.getByTitle('Bullet List');
            await fireEvent.mouseDown(btn);
            await fireEvent.click(btn);
            expect(mockChain.toggleBulletList).toHaveBeenCalled();
            expect(mockChain.run).toHaveBeenCalled();
        });

        it('toggles Task List', async () => {
            render(FormatBar, { props: { editor: mockEditor } });
            const btn = screen.getByTitle('Task List');
            await fireEvent.mouseDown(btn);
            await fireEvent.click(btn);
            expect(mockChain.toggleTaskList).toHaveBeenCalled();
            expect(mockChain.run).toHaveBeenCalled();
        });
    });

    // --- MediaButtons ---
    describe('Media', () => {
        it('unsets link if already active', async () => {
            mockEditor.isActive.mockImplementation((name: string) => name === 'link');
            render(FormatBar, { props: { editor: mockEditor } });

            const btn = screen.getByTitle('Link');
            await fireEvent.mouseDown(btn);
            await fireEvent.click(btn);
            expect(mockChain.unsetLink).toHaveBeenCalled();
            expect(mockChain.run).toHaveBeenCalled();
        });

        it('inserts empty link format when no selection', async () => {
            render(FormatBar, { props: { editor: mockEditor } });

            const btn = screen.getByTitle('Link');
            await fireEvent.mouseDown(btn);
            await fireEvent.click(btn);
            expect(mockChain.insertContent).toHaveBeenCalledWith({ type: 'text', text: '[](url)' });
            expect(mockChain.setTextSelection).toHaveBeenCalledWith(1);
            expect(mockChain.run).toHaveBeenCalled();
        });

        it('wraps text in link format when text is selected', async () => {
            mockEditor.state.selection = { from: 5, to: 10 };
            mockEditor.state.doc.textBetween.mockReturnValue('Click');
            render(FormatBar, { props: { editor: mockEditor } });

            await fireEvent.click(screen.getByTitle('Link'));
            expect(mockChain.insertContent).toHaveBeenCalledWith({ type: 'text', text: '[Click](url)' });
            expect(mockChain.setTextSelection).toHaveBeenCalledWith({ from: 13, to: 16 });
            expect(mockChain.run).toHaveBeenCalled();
        });

        it('inserts empty image format when no selection', async () => {
            render(FormatBar, { props: { editor: mockEditor } });

            const btn = screen.getByTitle('Image');
            await fireEvent.mouseDown(btn);
            await fireEvent.click(btn);
            expect(mockChain.insertContent).toHaveBeenCalledWith({ type: 'text', text: '![alt text](image.jpg)' });
            expect(mockChain.setTextSelection).toHaveBeenCalledWith(2);
            expect(mockChain.run).toHaveBeenCalled();
        });

        it('wraps text in image format when text is selected', async () => {
            mockEditor.state.selection = { from: 5, to: 10 };
            mockEditor.state.doc.textBetween.mockReturnValue('Photo');
            render(FormatBar, { props: { editor: mockEditor } });

            await fireEvent.click(screen.getByTitle('Image'));
            expect(mockChain.insertContent).toHaveBeenCalledWith({ type: 'text', text: '![Photo](image.jpg)' });
            expect(mockChain.setTextSelection).toHaveBeenCalledWith({ from: 14, to: 23 });
            expect(mockChain.run).toHaveBeenCalled();
        });
    });

    // --- HeadingSelector ---
    describe('HeadingSelector', () => {
        it('opens and closes dropdown', async () => {
            render(FormatBar, { props: { editor: mockEditor } });

            const trigger = screen.getByTitle('Headers');
            await fireEvent.mouseDown(trigger);
            await fireEvent.click(trigger);

            expect(document.querySelector('.heading-dropdown')).not.toBeNull();

            // Clicking outside closes it (simulated by clicking window)
            await fireEvent.click(window);
            expect(document.querySelector('.heading-dropdown')).toBeNull();
        });

        it('sets heading levels', async () => {
            mockChain.toggleHeading = vi.fn().mockReturnThis();
            render(FormatBar, { props: { editor: mockEditor } });

            await fireEvent.click(screen.getByTitle('Headers')); // Open
            await fireEvent.click(screen.getByText('Heading 2'));   // Select

            expect(mockChain.toggleHeading).toHaveBeenCalledWith({ level: 2 });
            expect(mockChain.run).toHaveBeenCalled();
            expect(document.querySelector('.heading-dropdown')).toBeNull();
        });

        it('sets paragraph', async () => {
            mockChain.setParagraph = vi.fn().mockReturnThis();
            render(FormatBar, { props: { editor: mockEditor } });

            await fireEvent.click(screen.getByTitle('Headers')); // Open
            await fireEvent.click(screen.getByText('Normal Text')); // Select

            expect(mockChain.setParagraph).toHaveBeenCalled();
            expect(mockChain.run).toHaveBeenCalled();
        });
    });

    describe('Null Editor Fallbacks', () => {
        it('handles MarkButtons with null editor', async () => {
            render(MarkButtons, { props: { editor: null } });
            const btn = screen.getByTitle('Bold');
            await fireEvent.mouseDown(btn);
            await fireEvent.click(btn);
            // Should not throw
        });

        it('handles ListButtons with null editor', async () => {
            render(ListButtons, { props: { editor: null } });
            const btn = screen.getByTitle('Ordered List');
            await fireEvent.mouseDown(btn);
            await fireEvent.click(btn);
            // Should not throw
        });

        it('handles MediaButtons with null editor', async () => {
            render(MediaButtons, { props: { editor: null } });
            const btn = screen.getByTitle('Link');
            await fireEvent.mouseDown(btn);
            await fireEvent.click(btn);
            // Should not throw
        });

        it('handles HeadingSelector with null editor', async () => {
            render(HeadingSelector, { props: { editor: null } });
            const btn = screen.getByTitle('Headers');
            await fireEvent.mouseDown(btn);
            await fireEvent.click(btn);
            // Clicking a dropdown item when editor is null
            const option = screen.getByText('Heading 2');
            await fireEvent.click(option);
            // Should not throw
        });
    });
});
