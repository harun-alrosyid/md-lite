import { vi } from 'vitest';

const mockWindow = {
    close: vi.fn().mockResolvedValue(undefined),
};

export const getCurrentWindow = vi.fn(() => mockWindow);
