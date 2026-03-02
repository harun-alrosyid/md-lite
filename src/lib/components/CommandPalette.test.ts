import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import CommandPalette from './CommandPalette.svelte';

// We mock the commands module so we can control the commands injected into the palette
vi.mock('../core/commands', async () => {
    const actual = await vi.importActual('../core/commands') as any;
    return {
        ...actual,
        createCommands: vi.fn(),
    };
});

import { createCommands, type Command } from '../core/commands';

describe('CommandPalette', () => {
    const mockHandlers = {
        onNew: vi.fn(),
        onOpen: vi.fn(),
        onSave: vi.fn(),
    } as any;

    const mockConfig = {
        onNew: 'mod+n',
        onOpen: 'mod+o',
    } as any;

    const mockCmd1: Command = { id: 'new', label: 'New File', category: 'File', action: vi.fn() };
    const mockCmd2: Command = { id: 'open', label: 'Open File', category: 'File', action: vi.fn() };
    const mockCmd3: Command = { id: 'custom-shortcuts', label: 'Shortcuts', category: 'Settings', action: vi.fn(), shortcut: 'mod+k' };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(createCommands).mockReturnValue([mockCmd1, mockCmd2, mockCmd3]);
        // Mock scrollIntoView to prevent JSDOM errors
        Element.prototype.scrollIntoView = vi.fn();

        // requestAnimationFrame mock so actions defer cleanly
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
            cb(0);
            return 0;
        });
    });

    it('does not render when visible is false', () => {
        const { container } = render(CommandPalette, {
            props: { visible: false, handlers: mockHandlers, config: mockConfig, onClose: vi.fn() }
        });
        expect(container.querySelector('.palette-backdrop')).toBeNull();
    });

    it('renders and focuses input when visible is true', async () => {
        const { container } = render(CommandPalette, {
            props: { visible: true, handlers: mockHandlers, config: mockConfig, onClose: vi.fn() }
        });
        expect(container.querySelector('.palette-backdrop')).not.toBeNull();

        // Wait for focus effect
        await waitFor(() => {
            const input = screen.getByPlaceholderText('Type a command…');
            expect(document.activeElement).toBe(input);
        });
    });

    it('displays all commands initially', () => {
        render(CommandPalette, {
            props: { visible: true, handlers: mockHandlers, config: mockConfig, onClose: vi.fn() }
        });

        expect(screen.getByText('New File')).toBeTruthy();
        expect(screen.getByText('Open File')).toBeTruthy();
        expect(screen.getByText('Shortcuts')).toBeTruthy();
    });

    it('filters commands on input', async () => {
        render(CommandPalette, {
            props: { visible: true, handlers: mockHandlers, config: mockConfig, onClose: vi.fn() }
        });

        const input = screen.getByPlaceholderText('Type a command…') as HTMLInputElement;
        input.value = 'New';
        await fireEvent.input(input);

        await waitFor(() => {
            expect(screen.getByText('New File')).toBeTruthy();
            expect(screen.queryByText('Open File')).toBeNull();
        });
    });

    it('shows empty state when no commands match', async () => {
        render(CommandPalette, {
            props: { visible: true, handlers: mockHandlers, config: mockConfig, onClose: vi.fn() }
        });

        const input = screen.getByPlaceholderText('Type a command…') as HTMLInputElement;
        input.value = 'XYZ';
        await fireEvent.input(input);

        await waitFor(() => {
            expect(screen.getByText('No matching commands')).toBeTruthy();
        });
    });

    it('closes on Escape key', async () => {
        const onClose = vi.fn();
        render(CommandPalette, {
            props: { visible: true, handlers: mockHandlers, config: mockConfig, onClose }
        });

        const input = screen.getByPlaceholderText('Type a command…');
        await fireEvent.keyDown(input, { key: 'Escape' });

        expect(onClose).toHaveBeenCalledOnce();
    });

    it('closes on backdrop click', async () => {
        const onClose = vi.fn();
        const { container } = render(CommandPalette, {
            props: { visible: true, handlers: mockHandlers, config: mockConfig, onClose }
        });

        const backdrop = container.querySelector('.palette-backdrop')!;
        await fireEvent.click(backdrop);

        expect(onClose).toHaveBeenCalledOnce();
    });

    describe('Keyboard navigation', () => {
        it('navigates with ArrowDown and ArrowUp', async () => {
            const { container } = render(CommandPalette, {
                props: { visible: true, handlers: mockHandlers, config: mockConfig, onClose: vi.fn() }
            });

            const input = screen.getByPlaceholderText('Type a command…');

            let items = container.querySelectorAll('.palette-item');
            expect(items[0].classList.contains('selected')).toBe(true);

            await fireEvent.keyDown(input, { key: 'ArrowDown' });
            await waitFor(() => {
                items = container.querySelectorAll('.palette-item');
                expect(items[0].classList.contains('selected')).toBe(false);
                expect(items[1].classList.contains('selected')).toBe(true);
            });

            await fireEvent.keyDown(input, { key: 'ArrowUp' });
            await waitFor(() => {
                items = container.querySelectorAll('.palette-item');
                expect(items[0].classList.contains('selected')).toBe(true);
                expect(items[1].classList.contains('selected')).toBe(false);
            });

            await fireEvent.keyDown(input, { key: 'ArrowUp' });
            await waitFor(() => {
                items = container.querySelectorAll('.palette-item');
                expect(items[2].classList.contains('selected')).toBe(true);
            });

            await fireEvent.keyDown(input, { key: 'ArrowDown' });
            await waitFor(() => {
                items = container.querySelectorAll('.palette-item');
                expect(items[0].classList.contains('selected')).toBe(true);
            });
        });

        it('executes command on Enter', async () => {
            const onClose = vi.fn();
            render(CommandPalette, {
                props: { visible: true, handlers: mockHandlers, config: mockConfig, onClose }
            });

            const input = screen.getByPlaceholderText('Type a command…');

            await fireEvent.keyDown(input, { key: 'ArrowDown' });
            await tick();
            await fireEvent.keyDown(input, { key: 'Enter' });

            expect(onClose).toHaveBeenCalledOnce();
            expect(mockCmd2.action).toHaveBeenCalledOnce();
        });

        it('does not execute on Enter if list is empty', async () => {
            const onClose = vi.fn();
            render(CommandPalette, {
                props: { visible: true, handlers: mockHandlers, config: mockConfig, onClose }
            });

            const input = screen.getByPlaceholderText('Type a command…') as HTMLInputElement;
            input.value = 'XYZ';
            await fireEvent.input(input);

            await waitFor(() => {
                expect(screen.getByText('No matching commands')).toBeTruthy();
            });

            await fireEvent.keyDown(input, { key: 'Enter' });

            expect(onClose).not.toHaveBeenCalled();
            expect(mockCmd1.action).not.toHaveBeenCalled();
            expect(mockCmd2.action).not.toHaveBeenCalled();
        });
    });

    it('mouse hover selects item', async () => {
        const { container } = render(CommandPalette, {
            props: { visible: true, handlers: mockHandlers, config: mockConfig, onClose: vi.fn() }
        });

        const items = container.querySelectorAll('.palette-item');
        await fireEvent.mouseEnter(items[2]);
        await waitFor(() => {
            expect(items[2].classList.contains('selected')).toBe(true);
        });
    });

    it('mouse click executes item', async () => {
        const onClose = vi.fn();
        const { container } = render(CommandPalette, {
            props: { visible: true, handlers: mockHandlers, config: mockConfig, onClose }
        });

        const items = container.querySelectorAll('.palette-item');
        await fireEvent.click(items[1]);

        expect(onClose).toHaveBeenCalledOnce();
        expect(mockCmd2.action).toHaveBeenCalledOnce();
    });

    it('clamps selection index if filtering reduces list length', async () => {
        const { container } = render(CommandPalette, {
            props: { visible: true, handlers: mockHandlers, config: mockConfig, onClose: vi.fn() }
        });

        const input = screen.getByPlaceholderText('Type a command…') as HTMLInputElement;

        await fireEvent.keyDown(input, { key: 'ArrowUp' });
        await waitFor(() => {
            const items = container.querySelectorAll('.palette-item');
            expect(items[2].classList.contains('selected')).toBe(true);
        });

        input.value = 'New File';
        await fireEvent.input(input);

        await waitFor(() => {
            const items = container.querySelectorAll('.palette-item');
            expect(items.length).toBe(1);
        });

        await fireEvent.keyDown(input, { key: 'ArrowDown' });
        await waitFor(() => {
            const items = container.querySelectorAll('.palette-item');
            expect(items[0].classList.contains('selected')).toBe(true);
        });
    });
});
