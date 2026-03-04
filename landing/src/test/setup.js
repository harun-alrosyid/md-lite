import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] ?? null,
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; },
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.scrollTo
window.scrollTo = vi.fn();

// Mock window.location (to allow href assignment in Support.jsx)
delete window.location;
window.location = { href: '' };
