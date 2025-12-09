import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ErrorIndex from '../error_index';

describe('ErrorIndex', () => {
    it('renders null when errors prop is null', () => {
        const { container } = render(<ErrorIndex errors={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders null when errors prop is an empty array', () => {
        const { container } = render(<ErrorIndex errors={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders a single error message correctly', () => {
        const errors = ['This is an error message'];
        render(<ErrorIndex errors={errors} />);
        expect(screen.getByText('This is an error message')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(1);
    });

    it('renders multiple error messages correctly', () => {
        const errors = ['Error 1', 'Error 2', 'Error 3'];
        render(<ErrorIndex errors={errors} />);
        expect(screen.getByText('Error 1')).toBeInTheDocument();
        expect(screen.getByText('Error 2')).toBeInTheDocument();
        expect(screen.getByText('Error 3')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });

    it('renders the correct class name for the error display div', () => {
        const errors = ['Test error'];
        render(<ErrorIndex errors={errors} />);
        const errorDiv = screen.getByText('Test error').closest('div');
        expect(errorDiv).toHaveClass('error-display');
    });
});