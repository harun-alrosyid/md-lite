import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/svelte';
import ShortcutConfigModal from './ShortcutConfigModal.svelte';
import * as shortcutStore from './shortcutStore';

vi.mock('./shortcutStore', async () => {
    const actual = await vi.importActual('./shortcutStore') as any;
    return {
        ...actual,
        loadShortcuts: vi.fn(),
        saveShortcuts: vi.fn(),
    };
});

describe('ShortcutConfigModal.svelte', () => {
    let onCloseMock: ReturnType<typeof vi.fn>;
    let onSaveMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        onCloseMock = vi.fn();
        onSaveMock = vi.fn();
        vi.mocked(shortcutStore.loadShortcuts).mockReturnValue({
            ...shortcutStore.defaultShortcuts
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('does not render if visible is false', () => {
        render(ShortcutConfigModal, { props: { visible: false, onClose: onCloseMock as any, onSave: onSaveMock as any } });
        expect(document.querySelector('.modal-backdrop')).toBeNull();
    });

    it('renders when visible is true and loads shortcuts', () => {
        render(ShortcutConfigModal, { props: { visible: true, onClose: onCloseMock as any, onSave: onSaveMock as any } });
        expect(document.querySelector('.modal-backdrop')).not.toBeNull();
        expect(shortcutStore.loadShortcuts).toHaveBeenCalled();
        expect(screen.getByText('New File')).toBeDefined();
    });

    it('enters listening mode when a shortcut is clicked', async () => {
        render(ShortcutConfigModal, { props: { visible: true, onClose: onCloseMock as any, onSave: onSaveMock as any } });

        // Find the button next to "New File"
        const row = screen.getByText('New File').parentElement!;
        const btn = row.querySelector('.shortcut-btn')!;

        await fireEvent.click(btn);
        expect(btn.textContent).toContain('Press keys... (Esc to cancel)');
    });

    it('cancels listening on Escape', async () => {
        render(ShortcutConfigModal, { props: { visible: true, onClose: onCloseMock as any, onSave: onSaveMock as any } });

        const row = screen.getByText('New File').parentElement!;
        const btn = row.querySelector('.shortcut-btn')!;

        await fireEvent.click(btn); // Start listening

        const modal = document.querySelector('.modal-content')!;
        await fireEvent.keyDown(modal, { key: 'Escape' });

        // Should revert back to ⌘ N (or the default in actual loadShortcuts)
        // Since loadShortcuts is now loading the full map, the default for new is CmdOrCtrl+N
        expect(btn.textContent).toContain('N');
    });

    it('captures new shortcut when keys are pressed', async () => {
        render(ShortcutConfigModal, { props: { visible: true, onClose: onCloseMock as any, onSave: onSaveMock as any } });

        const row = screen.getByText('New File').parentElement!;
        const btn = row.querySelector('.shortcut-btn')!;

        await fireEvent.click(btn); // Start listening

        const modal = document.querySelector('.modal-content')!;
        await fireEvent.keyDown(modal, { key: 'l', metaKey: true });

        // Modal logic assigns 'CmdOrCtrl+L' visually to something like ⌘ L depending on Mac/Windows
        // The text content should contain L
        expect(btn.textContent).toContain('L');
    });

    it('rejects standalone keys without modifiers', async () => {
        render(ShortcutConfigModal, { props: { visible: true, onClose: onCloseMock as any, onSave: onSaveMock as any } });

        const row = screen.getByText('New File').parentElement!;
        const btn = row.querySelector('.shortcut-btn')!;

        await fireEvent.click(btn); // Start listening

        const modal = document.querySelector('.modal-content')!;
        await fireEvent.keyDown(modal, { key: 'a' });

        const conflict = document.querySelector('.conflict-alert');
        expect(conflict).not.toBeNull();
        expect(conflict?.textContent).toContain('Shortcut must include a modifier');
    });

    it('rejects conflicting shortcuts', async () => {
        render(ShortcutConfigModal, { props: { visible: true, onClose: onCloseMock as any, onSave: onSaveMock as any } });

        const row = screen.getByText('New File').parentElement!;
        const btn = row.querySelector('.shortcut-btn')!;

        await fireEvent.click(btn); // Start listening

        const modal = document.querySelector('.modal-content')!;
        // Try to set 'CmdOrCtrl+S' which is used by "Save File"
        await fireEvent.keyDown(modal, { key: 's', metaKey: true });

        const conflict = document.querySelector('.conflict-alert');
        expect(conflict).not.toBeNull();
        expect(conflict?.textContent).toContain('is already assigned to "Save File"');
    });

    it('resets to defaults when Reset Defaults is clicked', async () => {
        vi.mocked(shortcutStore.loadShortcuts).mockReturnValue({
            ...shortcutStore.defaultShortcuts,
            onNew: 'CmdOrCtrl+Z', // mutated from normal
        } as any);
        render(ShortcutConfigModal, { props: { visible: true, onClose: onCloseMock as any, onSave: onSaveMock as any } });

        const resetBtn = screen.getByText('Reset Defaults');
        await fireEvent.click(resetBtn);

        // Should reset to default, which for onNew is 'CmdOrCtrl+N' (since we mocked it)
        const row = screen.getByText('New File').parentElement!;
        const btn = row.querySelector('.shortcut-btn')!;
        expect(btn.textContent).toContain('N');
    });

    it('saves and closes on Save Changes', async () => {
        render(ShortcutConfigModal, { props: { visible: true, onClose: onCloseMock as any, onSave: onSaveMock as any } });

        const saveBtn = screen.getByText('Save Changes');
        await fireEvent.click(saveBtn);

        expect(shortcutStore.saveShortcuts).toHaveBeenCalled();
        expect(onSaveMock).toHaveBeenCalled();
        expect(onCloseMock).toHaveBeenCalled();
    });

    it('closes on Escape when not listening', async () => {
        render(ShortcutConfigModal, { props: { visible: true, onClose: onCloseMock as any, onSave: onSaveMock as any } });

        const modal = document.querySelector('.modal-content')!;
        await fireEvent.keyDown(modal, { key: 'Escape' });

        expect(onCloseMock).toHaveBeenCalled();
    });
});
