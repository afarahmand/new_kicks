// src/components/__tests__/Button.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

function Button({ children, onClick }) {
    return <button onClick={onClick}>{children}</button>;
}

describe('Button', () => {
    it('renders button text', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });
});