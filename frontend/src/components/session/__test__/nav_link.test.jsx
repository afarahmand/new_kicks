import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import NavLink from '../nav_link';
import React from 'react';

describe('NavLink', () => {
    it('renders "Sign up!" link when formType is "Sign in"', () => {
        render(
            <MemoryRouter>
                <NavLink formType="Sign in" />
            </MemoryRouter>
        );
        const linkElement = screen.getByRole('link', { name: /Sign up!/i });
        expect(linkElement).toBeInTheDocument();
        expect(linkElement).toHaveAttribute('href', '/signup');
    });

    it('renders "Sign in" link when formType is not "Sign in"', () => {
        render(
            <MemoryRouter>
                <NavLink formType="Sign up" />
            </MemoryRouter>
        );
        const linkElement = screen.getByRole('link', { name: /Sign in/i });
        expect(linkElement).toBeInTheDocument();
        expect(linkElement).toHaveAttribute('href', '/signin');
    });

    it('renders "Sign in" link by default for other formType values', () => {
        render(
            <MemoryRouter>
                <NavLink formType="Login" />
            </MemoryRouter>
        );
        const linkElement = screen.getByRole('link', { name: /Sign in/i });
        expect(linkElement).toBeInTheDocument();
        expect(linkElement).toHaveAttribute('href', '/signin');
    });
});