import { describe, it, expect } from 'vitest';
import { extractHeadings, getActiveHeading, type OutlineHeading } from './outline';

// Mock barebones Editor structure needed for tests
function createMockEditor(descendantsOutput: any[], selectionFrom: number) {
    return {
        state: {
            doc: {
                descendants: (callback: (node: any, pos: number) => void) => {
                    descendantsOutput.forEach(item => {
                        callback(item.node, item.pos);
                    });
                }
            },
            selection: {
                from: selectionFrom
            }
        },
        chain: () => ({
            focus: () => ({
                setTextSelection: () => ({
                    scrollIntoView: () => ({
                        run: () => { }
                    })
                })
            })
        })
    } as any;
}

describe('outline - AST parsing', () => {
    it('extracts headings from editor AST correctly', () => {
        const mockNodes = [
            { pos: 0, node: { type: { name: 'paragraph' }, textContent: 'Hello world' } },
            { pos: 12, node: { type: { name: 'heading' }, attrs: { level: 1 }, textContent: 'Title' } },
            { pos: 20, node: { type: { name: 'heading' }, attrs: { level: 2 }, textContent: 'Subtitle' } }
        ];

        const editor = createMockEditor(mockNodes, 0);
        const headings = extractHeadings(editor);

        expect(headings.length).toBe(2);

        expect(headings[0].id).toBe('heading-12');
        expect(headings[0].level).toBe(1);
        expect(headings[0].text).toBe('Title');
        expect(headings[0].pos).toBe(12);

        expect(headings[1].id).toBe('heading-20');
        expect(headings[1].level).toBe(2);
        expect(headings[1].text).toBe('Subtitle');
        expect(headings[1].pos).toBe(20);
    });

    it('returns empty array when no headings exist', () => {
        const mockNodes = [
            { pos: 0, node: { type: { name: 'paragraph' }, textContent: 'Hello world' } }
        ];

        const editor = createMockEditor(mockNodes, 0);
        const headings = extractHeadings(editor);
        expect(headings.length).toBe(0);
    });

    it('returns empty array if editor is null', () => {
        const headings = extractHeadings(null as any);
        expect(headings.length).toBe(0);
    });
});

describe('outline - Context Tracking', () => {
    const headings: OutlineHeading[] = [
        { id: 'heading-10', level: 1, text: 'H1', pos: 10 },
        { id: 'heading-50', level: 2, text: 'H2', pos: 50 },
        { id: 'heading-100', level: 3, text: 'H3', pos: 100 }
    ];

    it('returns null if cursor is before first heading', () => {
        const editor = createMockEditor([], 5);
        const active = getActiveHeading(editor, headings);
        expect(active).toBeNull();
    });

    it('returns first heading if cursor is inside first section', () => {
        const editor = createMockEditor([], 15);
        const active = getActiveHeading(editor, headings);
        expect(active).toBe('heading-10');
    });

    it('returns exact heading if cursor is on it', () => {
        const editor = createMockEditor([], 50);
        const active = getActiveHeading(editor, headings);
        expect(active).toBe('heading-50');
    });

    it('returns last heading if cursor is way past it', () => {
        const editor = createMockEditor([], 500);
        const active = getActiveHeading(editor, headings);
        expect(active).toBe('heading-100');
    });

    it('returns null if headings array is empty', () => {
        const editor = createMockEditor([], 10);
        const active = getActiveHeading(editor, []);
        expect(active).toBeNull();
    });
});
