import { render, screen } from '@testing-library/react';
import ProductPreview from '../components/ProductPreview';

describe('ProductPreview', () => {
    it('renders the product preview image', () => {
        render(<ProductPreview />);
        const img = screen.getByAltText('MD Lite Product Preview');
        expect(img).toBeInTheDocument();
    });

    it('has the correct image src', () => {
        render(<ProductPreview />);
        const img = screen.getByAltText('MD Lite Product Preview');
        expect(img).toHaveAttribute('src', '/screenshots/product-preview.jpg');
    });
});
