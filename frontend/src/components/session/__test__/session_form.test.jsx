import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider, useDispatch } from 'react-redux';
import { HashRouter, useLocation } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';

import SessionForm from '../session_form';
import {
    receiveSessionErrors,
    signin,
    signup
} from '../../../actions/session_actions';

// Mock the child components
vi.mock('../shared/error_index', () => ({
    __esModule: true,
    default: ({ errors }) => (
        <div data-testid="error-index">
            <ul>
                {errors?.map((error, idx) => (
                    <li key={idx} data-testid="error-item">{error}</li>
                ))}
            </ul>
        </div>
    )
}));

vi.mock('./nav_link', () => ({
    __esModule: true,
    default: ({ formType }) => (
        <nav data-testid="nav-link">
            {formType === 'Sign up' ? 'Switch to Sign In' : 'Switch to Sign Up'}
        </nav>
    )
}));

vi.mock('./top_text', () => ({
    __esModule: true,
    default: ({ formType }) => (
        <h1 data-testid="top-text">{formType}</h1>
    )
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useLocation: vi.fn()
    };
});

// Mock actions
vi.mock('../../../actions/session_actions', () => ({
    receiveSessionErrors: vi.fn((errors) => ({
        type: 'RECEIVE_SESSION_ERRORS',
        errors: errors || []
    })),
    signin: vi.fn((user) => Promise.resolve({ user })),
    signup: vi.fn((user) => Promise.resolve({ user }))
}));

// Create a test store helper
const createTestStore = (initialState = {}) => {
    return configureStore({
        reducer: {
            errors: (state = initialState.errors || { session: [] }, action) => {
                if (action.type === 'RECEIVE_SESSION_ERRORS') {
                    return { session: action.errors };
                }
                return state;
            },
            session: (state = initialState.session || { id: null, currentUser: null }, action) => {
                // Basic session reducer for testing purposes
                return state;
            }
        }
    });
};

// Mock react-redux
vi.mock('react-redux', async () => {
    const actual = await vi.importActual('react-redux');
    return {
        ...actual,
        useDispatch: vi.fn(),
    };
});

// Test wrapper component
const TestWrapper = ({ store, path = '/signin' }) => {
    // Mock the useLocation hook
    vi.mocked(useLocation).mockReturnValue({
        pathname: path,
        search: '',
        hash: '',
        state: null,
        key: 'default'
    });

    // Mock useDispatch to prevent errors from being cleared prematurely
    vi.mocked(useDispatch).mockReturnValue(vi.fn(action => typeof action === 'function' ? action(vi.fn()) : action));

    return (
        <Provider store={store}>
            <HashRouter>
                <SessionForm />
            </HashRouter>
        </Provider>
    );
};

describe('SessionForm', () => {
    let store;
    let user;

    beforeEach(() => {
        vi.clearAllMocks();
        store = createTestStore();
        user = userEvent.setup();
    });

    describe('Sign In Form', () => {
        beforeEach(() => {
            vi.mocked(useLocation).mockReturnValue({
                pathname: '/signin',
                search: '',
                hash: '',
                state: null,
                key: 'default'
            });
        });

        it('renders sign in form correctly', () => {
            render(<TestWrapper store={store} path="/signin" />);

            expect(screen.getByTestId('top-text')).toHaveTextContent('Sign in');
            expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
            expect(screen.queryByPlaceholderText('Name')).not.toBeInTheDocument();
            expect(screen.getByText('Log me in!')).toBeInTheDocument();
            expect(screen.getByText('Sign In as Demo User')).toBeInTheDocument();
        });

        it('handles email input changes', async () => {
            render(<TestWrapper store={store} path="/signin" />);

            const emailInput = screen.getByPlaceholderText('Email');
            await user.type(emailInput, 'test@example.com');

            expect(emailInput).toHaveValue('test@example.com');
        });

        it('handles password input changes', async () => {
            render(<TestWrapper store={store} path="/signin" />);

            const passwordInput = screen.getByPlaceholderText('Password');
            await user.type(passwordInput, 'testpassword');

            expect(passwordInput).toHaveValue('testpassword');
        });

        it('submits sign in form with user data', async () => {
            render(<TestWrapper store={store} path="/signin" />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const submitButton = screen.getByText('Log me in!');

            await user.type(emailInput, 'test@example.com');
            await user.type(passwordInput, 'password123');
            await user.click(submitButton);

            // The form should dispatch signin action
            expect(signin).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123'
            });
        });

        it('handles demo sign in', async () => {
            render(<TestWrapper store={store} path="/signin" />);

            const demoButton = screen.getByText('Sign In as Demo User');
            await user.click(demoButton);

            expect(signin).toHaveBeenCalledWith({
                name: "Demo_User",
                email: "demo@quickstarter.com",
                password: "password"
            });
        });
    });

    describe('Sign Up Form', () => {
        beforeEach(() => {
            vi.mocked(useLocation).mockReturnValue({
                pathname: '/signup',
                search: '',
                hash: '',
                state: null,
                key: 'default'
            });
        });

        it('renders sign up form correctly', () => {
            render(<TestWrapper store={store} path="/signup" />);

            expect(screen.getByTestId('top-text')).toHaveTextContent('Sign up');
            expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
            expect(screen.getByText('Create account')).toBeInTheDocument();
            expect(screen.queryByText('Sign In as Demo User')).not.toBeInTheDocument();
        });

        it('handles name input changes', async () => {
            render(<TestWrapper store={store} path="/signup" />);

            const nameInput = screen.getByPlaceholderText('Name');
            await user.type(nameInput, 'John Doe');

            expect(nameInput).toHaveValue('John Doe');
        });

        it('submits sign up form with user data', async () => {
            render(<TestWrapper store={store} path="/signup" />);

            const nameInput = screen.getByPlaceholderText('Name');
            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const submitButton = screen.getByText('Create account');

            await user.type(nameInput, 'John Doe');
            await user.type(emailInput, 'john@example.com');
            await user.type(passwordInput, 'securepassword');
            await user.click(submitButton);

            expect(signup).toHaveBeenCalledWith({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'securepassword'
            });
        });
    });

    describe('Error Handling', () => {
        it('displays session errors', () => {
            const errorStore = createTestStore({
                errors: {
                    session: ['Invalid credentials', 'Email not found']
                }
            });

            render(<TestWrapper store={errorStore} path="/signin" />);

            const errorItems = screen.getAllByTestId('error-item');
            expect(errorItems).toHaveLength(2);
            expect(errorItems[0]).toHaveTextContent('Invalid credentials');
            expect(errorItems[1]).toHaveTextContent('Email not found');
        });

        it('clears errors when switching form types', async () => {
            const errorStore = createTestStore({
                errors: {
                    session: ['Some error']
                }
            });

            const { rerender } = render(<TestWrapper store={errorStore} path="/signin" />);

            // Initially shows errors
            expect(screen.getAllByTestId('error-item')).toHaveLength(1);

            // Switch to signup form
            vi.mocked(useLocation).mockReturnValue({
                pathname: '/signup',
                search: '',
                hash: '',
                state: null,
                key: 'default'
            });

            rerender(<TestWrapper store={errorStore} path="/signup" />);

            // Should have cleared errors
            expect(receiveSessionErrors).toHaveBeenCalledWith([]);
        });
    });

    describe('Form State Management', () => {
        it('resets form when switching between signin and signup', async () => {
            const { rerender } = render(<TestWrapper store={store} path="/signin" />);

            // Fill in signin form
            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            
            await user.type(emailInput, 'test@example.com');
            await user.type(passwordInput, 'password123');

            expect(emailInput).toHaveValue('test@example.com');
            expect(passwordInput).toHaveValue('password123');

            // Switch to signup
            vi.mocked(useLocation).mockReturnValue({
                pathname: '/signup',
                search: '',
                hash: '',
                state: null,
                key: 'default'
            });

            rerender(<TestWrapper store={store} path="/signup" />);

            // Form should be reset
            expect(screen.getByPlaceholderText('Email')).toHaveValue('');
            expect(screen.getByPlaceholderText('Password')).toHaveValue('');
            expect(screen.getByPlaceholderText('Name')).toHaveValue('');
        });

        it('updates formType based on route', async () => {
            const { rerender } = render(<TestWrapper store={store} path="/signin" />);

            expect(screen.getByTestId('top-text')).toHaveTextContent('Sign in');

            rerender(<TestWrapper store={store} path="/signup" />);
            expect(screen.getByTestId('top-text')).toHaveTextContent('Sign up');
        });
    });
});