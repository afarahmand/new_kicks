import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TopText from '../top_text';

describe('TopText', () => {
    it('renders "Sign up" when formType is "Sign up"', () => {
        render(<TopText formType="Sign up" />);
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Sign up');
    });

    it('renders "Sign in" when formType is "Sign in"', () => {
        render(<TopText formType="Sign in" />);
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Sign in');
    });

    it('renders "Sign in" by default when formType is not "Sign up"', () => {
        render(<TopText formType="Login" />); // Any other string should default to "Sign in"
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Sign in');
    });
});