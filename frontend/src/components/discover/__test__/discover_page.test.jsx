import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../../../reducers/root_reducer';
import DiscoverPage from '../discover_page';
import * as ProjectApiUtil from '../../../utils/project_api_util';

// Mock the DiscoverIndex component as it's a child component
vi.mock('../discover_index', () => ({
    default: vi.fn(() => <div data-testid="discover-index">Discover Index</div>),
}));

// Mock the fetchDiscoveryResults API utility
vi.mock('../../../utils/project_api_util', () => ({
    fetchDiscoveryResults: vi.fn(),
}));

const renderWithRedux = (component, { store }) => {
    return render(<Provider store={store}>{component}</Provider>);
};

describe('DiscoverPage', () => {
    let store;
    const mockCategories = {
        1: 'Art',
        2: 'Games',
        3: 'Technology',
    };
    const mockProjects = [
        { id: 1, title: 'Project A', category: 'Art' },
        { id: 2, title: 'Project B', category: 'Games' },
    ];

    beforeEach(() => {
        store = configureStore({
            reducer: rootReducer,
            preloadedState: {
                entities: {
                    categories: mockCategories,
                },
            },
        });
        ProjectApiUtil.fetchDiscoveryResults.mockResolvedValue(mockProjects);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing and displays default selections', async () => {
        renderWithRedux(<DiscoverPage />, { store });

        // Wait for the DiscoverIndex to appear, which implies fetchDiscoveryResults has completed
        await screen.findByTestId('discover-index');

        expect(screen.getByDisplayValue('All')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Random')).toBeInTheDocument();

        expect(ProjectApiUtil.fetchDiscoveryResults).toHaveBeenCalledWith('All', 'Random', 9);
    });

    it('displays categories from the Redux store in the dropdown', async () => {
        renderWithRedux(<DiscoverPage />, { store });

        await screen.findByTestId('discover-index'); // Wait for initial render and data fetch

        expect(screen.getByRole('option', { name: 'Art' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Games' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Technology' })).toBeInTheDocument();
    });

    it('calls fetchDiscoveryResults and updates searchResults when category changes', async () => {
        renderWithRedux(<DiscoverPage />, { store });

        await screen.findByTestId('discover-index'); // Wait for initial render

        fireEvent.change(screen.getByDisplayValue('All'), { target: { value: 'Art' } });

        await waitFor(() => {
            expect(ProjectApiUtil.fetchDiscoveryResults).toHaveBeenCalledWith('Art', 'Random', 9);
        });
    });

    it('calls fetchDiscoveryResults and updates searchResults when sort order changes', async () => {
        renderWithRedux(<DiscoverPage />, { store });

        await screen.findByTestId('discover-index'); // Wait for initial render

        fireEvent.change(screen.getByDisplayValue('Random'), { target: { value: 'Funding Goal' } });

        await waitFor(() => {
            expect(ProjectApiUtil.fetchDiscoveryResults).toHaveBeenCalledWith('All', 'Funding Goal', 9);
        });
    });

    it('passes the correct projects to DiscoverIndex', async () => {
        renderWithRedux(<DiscoverPage />, { store });

        await waitFor(() => {
            expect(ProjectApiUtil.fetchDiscoveryResults).toHaveBeenCalledTimes(1);
        });

        // Since DiscoverIndex is mocked, we can check if its mock function was called with the correct props
        // We are interested in the call after the data has been fetched.
        const { default: MockedDiscoverIndex } = await import('../discover_index');
        await waitFor(() => {
            // Expect the last call to DiscoverIndex to have the mockProjects
            const lastCall = MockedDiscoverIndex.mock.calls[MockedDiscoverIndex.mock.calls.length - 1];
            expect(lastCall[0]).toEqual({ projects: mockProjects });
        });
    });
});