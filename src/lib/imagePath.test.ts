import { describe, it, expect } from 'vitest';
import { getDirectory, resolveLocalPath } from './imagePath';

describe('imagePath utilities', () => {
    describe('getDirectory', () => {
        it('extracts directory from absolute path', () => {
            expect(getDirectory('/Users/test/Documents/file.md')).toBe('/Users/test/Documents');
        });

        it('returns empty string if no path', () => {
            expect(getDirectory('')).toBe('');
        });

        it('handles paths with no slashes', () => {
            expect(getDirectory('file.md')).toBe('');
        });
    });

    describe('resolveLocalPath', () => {
        it('ignores http/https/data/absolute paths', () => {
            expect(resolveLocalPath('/base', 'http://example.com/img.png')).toBe('http://example.com/img.png');
            expect(resolveLocalPath('/base', 'https://example.com/img.png')).toBe('https://example.com/img.png');
            expect(resolveLocalPath('/base', 'data:image/png;base64,123')).toBe('data:image/png;base64,123');
            expect(resolveLocalPath('/base', '/absolute/path/img.png')).toBe('/absolute/path/img.png');
        });

        it('resolves relative ./ paths', () => {
            expect(resolveLocalPath('/Users/test/Documents', './img.png')).toBe('/Users/test/Documents/img.png');
            expect(resolveLocalPath('/Users/test/Documents', 'img.png')).toBe('/Users/test/Documents/img.png');
        });

        it('resolves relative ../ paths', () => {
            expect(resolveLocalPath('/Users/test/Documents/Folder', '../img.png')).toBe('/Users/test/Documents/img.png');
            expect(resolveLocalPath('/Users/test/Documents/Folder', '../../img.png')).toBe('/Users/test/img.png');
        });

        it('handles complex relative paths', () => {
            expect(resolveLocalPath('/Users/test/Documents/Folder', '../OtherFolder/./img.png')).toBe('/Users/test/Documents/OtherFolder/img.png');
        });

        it('returns relative path if baseDir is empty', () => {
            expect(resolveLocalPath('', './img.png')).toBe('./img.png');
        });
    });
});
