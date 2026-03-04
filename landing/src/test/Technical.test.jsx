import { render, screen } from '@testing-library/react';
import Technical from '../components/Technical';

describe('Technical', () => {
    it('renders the section', () => {
        const { container } = render(<Technical />);
        expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('shows "Engineering Approach" badge', () => {
        render(<Technical />);
        expect(screen.getByText('Engineering Approach')).toBeInTheDocument();
    });

    it('shows the main heading', () => {
        render(<Technical />);
        expect(screen.getByText('Built for native performance.')).toBeInTheDocument();
    });

    it('shows description text about MD Lite', () => {
        render(<Technical />);
        expect(screen.getByText(/Rust core and reactive Svelte 5 frontend/i)).toBeInTheDocument();
    });

    it('shows "Vitest & Cargo Test" item', () => {
        render(<Technical />);
        expect(screen.getByText('Vitest & Cargo Test')).toBeInTheDocument();
    });

    it('shows Vitest & Cargo Test description', () => {
        render(<Technical />);
        expect(screen.getByText(/Rigorous frontend and Rust backend testing/i)).toBeInTheDocument();
    });

    it('shows "Tauri v2 Engine" item', () => {
        render(<Technical />);
        expect(screen.getByText('Tauri v2 Engine')).toBeInTheDocument();
    });

    it('shows Tauri v2 Engine description', () => {
        render(<Technical />);
        expect(screen.getByText(/Native binary output/i)).toBeInTheDocument();
    });

    it('renders the product preview image', () => {
        render(<Technical />);
        const img = screen.getByAltText('Technical detail of MD Lite');
        expect(img).toHaveAttribute('src', '/screenshots/product-preview-2.jpg');
    });
});
