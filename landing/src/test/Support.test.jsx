import { render, screen, fireEvent } from '@testing-library/react';
import Support from '../components/Support';

describe('Support', () => {
    beforeEach(() => {
        window.location.href = '';
    });

    it('renders the contact section with id="contact"', () => {
        render(<Support />);
        expect(document.querySelector('#contact')).toBeInTheDocument();
    });

    it('shows the section heading "Contact Developer"', () => {
        render(<Support />);
        expect(screen.getByText('Contact Developer')).toBeInTheDocument();
    });

    it('shows "Get in Touch" sub-heading', () => {
        render(<Support />);
        expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    });

    it('renders Name input field', () => {
        render(<Support />);
        const input = screen.getByPlaceholderText('Your name');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('type', 'text');
    });

    it('renders Email input field', () => {
        render(<Support />);
        const input = screen.getByPlaceholderText('your@email.com');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('type', 'email');
    });

    it('renders Message textarea field', () => {
        render(<Support />);
        const textarea = screen.getByPlaceholderText('How can we help you today?');
        expect(textarea).toBeInTheDocument();
    });

    it('updates name input value when typed', () => {
        render(<Support />);
        const input = screen.getByPlaceholderText('Your name');
        fireEvent.change(input, { target: { value: 'John Doe' } });
        expect(input.value).toBe('John Doe');
    });

    it('updates email input value when typed', () => {
        render(<Support />);
        const input = screen.getByPlaceholderText('your@email.com');
        fireEvent.change(input, { target: { value: 'john@example.com' } });
        expect(input.value).toBe('john@example.com');
    });

    it('updates message textarea value when typed', () => {
        render(<Support />);
        const textarea = screen.getByPlaceholderText('How can we help you today?');
        fireEvent.change(textarea, { target: { value: 'Hello there!' } });
        expect(textarea.value).toBe('Hello there!');
    });

    it('renders the Send Message submit button', () => {
        render(<Support />);
        const btn = screen.getByRole('button', { name: /Send Message/i });
        expect(btn).toHaveAttribute('type', 'submit');
    });

    it('handleSend sets window.location.href to correct mailto URL on form submit', () => {
        render(<Support />);

        fireEvent.change(screen.getByPlaceholderText('Your name'), {
            target: { value: 'Alice' },
        });
        fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
            target: { value: 'alice@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('How can we help you today?'), {
            target: { value: 'Help me please' },
        });

        const form = screen.getByRole('button', { name: /Send Message/i }).closest('form');
        fireEvent.submit(form);

        const href = window.location.href;
        expect(href).toMatch(/^mailto:hello@harunalrosyid\.com/);
        expect(href).toContain(encodeURIComponent('Alice'));
        expect(href).toContain(encodeURIComponent('Help me please'));
        expect(href).toContain(encodeURIComponent('alice@example.com'));
    });
});
