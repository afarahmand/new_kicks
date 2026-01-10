import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

// Mock useNavigate at the top level
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

// Mock other dependencies
vi.mock('../../../../utils/date_util', () => ({
    daysRemainingUntilEnd: vi.fn().mockReturnValue(25)
}));

vi.mock('../../../../actions/project_actions', () => {
    const deleteProjectMock = vi.fn((projectId) => (dispatch) => {
        // Simulate an async operation and dispatch success
        return Promise.resolve({ id: projectId }).then(response => {
            dispatch({ type: 'RECEIVE_PROJECTS', projects: {} }); // Mock a success action
            return response;
        });
    });
    return {
        deleteProject: deleteProjectMock
    };
});

// Import the component AFTER mocks
import ImageStatusSection from '../image_status_section.jsx';

// Import mocked modules for assertions
import { deleteProject } from '../../../../actions/project_actions';
import { daysRemainingUntilEnd } from '../../../../utils/date_util';

describe('ImageStatusSection', () => {
    // Mock project data
    const mockProject = {
        id: 123,
        user_id: 456,
        title: 'Test Project',
        image_url: 'https://example.com/image.jpg',
        funding_amount: 50000,
        funding_end_date: '2024-12-31T23:59:59Z'
    };

    // Mock store creator
    const createMockStore = (currentUser = null) => {
        return configureStore({
            reducer: {
                session: (state = { currentUser }) => state
            }
        });
    };

    const renderComponent = (project = mockProject, currentUser = null) => {
        const store = createMockStore(currentUser);
        
        return render(
            <Provider store={store}>
                <HashRouter>
                    <ImageStatusSection project={project} />
                </HashRouter>
            </Provider>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
        daysRemainingUntilEnd.mockReturnValue(25);
        

    });

    describe('basic rendering for any user', () => {
        it('renders project image with correct attributes', () => {
            renderComponent();
            
            const image = screen.getByRole('img', { name: '' });
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute('src', mockProject.image_url);
            expect(image).toHaveClass('col-12');
        });

        it('renders funding goal section', () => {
            renderComponent();
            
            const goalAmount = screen.getByText(`$${mockProject.funding_amount}`);
            expect(goalAmount).toBeInTheDocument();
            expect(goalAmount).toHaveClass('one', 'goal');
            
            expect(screen.getByText('funding goal')).toBeInTheDocument();
        });

        it('calls daysRemainingUntilEnd with correct date and displays result', () => {
            renderComponent();
            
            expect(daysRemainingUntilEnd).toHaveBeenCalledTimes(1);
            expect(daysRemainingUntilEnd).toHaveBeenCalledWith(mockProject.funding_end_date);
            
            const daysElement = screen.getByText('25');
            expect(daysElement).toBeInTheDocument();
            expect(daysElement).toHaveClass('one');
            
            expect(screen.getByText('days to go')).toBeInTheDocument();
        });

        it('renders "All or nothing" disclaimer with formatted date', () => {
            renderComponent();
            
            expect(screen.getByText('All or nothing.')).toBeInTheDocument();
            
            const expectedText = `This project will only be funded if it reaches its goal by ${mockProject.funding_end_date.slice(0, 10)}.`;
            expect(screen.getByText(expectedText)).toBeInTheDocument();
        });

        it('has correct container structure and classes', () => {
            renderComponent();
            
            const section = document.querySelector('.show-status');
            expect(section).toBeInTheDocument();
            
            const statusDiv = document.querySelector('.status');
            expect(statusDiv).toBeInTheDocument();
            expect(statusDiv).toHaveClass('col-3');
            
            expect(document.querySelector('.all-nothing-container')).toBeInTheDocument();
        });
    });

    describe('when user is logged out', () => {
        it('does not render any action buttons', () => {
            renderComponent(mockProject, null);
            
            expect(screen.queryByText('Edit Project')).not.toBeInTheDocument();
            expect(screen.queryByText('Delete Project')).not.toBeInTheDocument();
            expect(screen.queryByText('Edit Rewards')).not.toBeInTheDocument();
        });
    });

    describe('when user is NOT the project creator', () => {
        const otherUser = { id: 999, username: 'other_user' };

        it('does not render edit/delete buttons', () => {
            renderComponent(mockProject, otherUser);
            
            expect(screen.queryByText('Edit Project')).not.toBeInTheDocument();
            expect(screen.queryByText('Delete Project')).not.toBeInTheDocument();
        });

        it('does not render edit rewards button', () => {
            renderComponent(mockProject, otherUser);
            
            expect(screen.queryByText('Edit Rewards')).not.toBeInTheDocument();
        });
    });

    describe('when user IS the project creator', () => {
        const creatorUser = { id: 456, username: 'project_creator' };

        it('renders edit project button with correct styling', () => {
            renderComponent(mockProject, creatorUser);
            
            const editButton = screen.getByText('Edit Project');
            expect(editButton).toBeInTheDocument();
            expect(editButton).toHaveClass('edit-button');
        });

        it('navigates to edit page when edit project button is clicked', () => {
            renderComponent(mockProject, creatorUser);
            
            fireEvent.click(screen.getByText('Edit Project'));
            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith(`/projects/${mockProject.id}/edit`);
        });

        it('renders delete project button with correct styling', () => {
            renderComponent(mockProject, creatorUser);
            
            const deleteButton = screen.getByText('Delete Project');
            expect(deleteButton).toBeInTheDocument();
            expect(deleteButton).toHaveClass('delete-button');
        });

        it('calls deleteProject when delete button is clicked', () => {
            renderComponent(mockProject, creatorUser);
            
            fireEvent.click(screen.getByText('Delete Project'));
            
            expect(deleteProject).toHaveBeenCalledTimes(1);
            expect(deleteProject).toHaveBeenCalledWith(mockProject.id);
        });

        it('renders edit rewards button with correct styling', () => {
            renderComponent(mockProject, creatorUser);
            
            const rewardsButton = screen.getByText('Edit Rewards');
            expect(rewardsButton).toBeInTheDocument();
            expect(rewardsButton).toHaveClass('reward-button', 'green');
        });

        it('navigates to edit rewards page when edit rewards button is clicked', () => {
            renderComponent(mockProject, creatorUser);
            
            fireEvent.click(screen.getByText('Edit Rewards'));
            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith(`/projects/${mockProject.id}/rewards/edit`);
        });

        it('renders all action buttons in correct containers', () => {
            renderComponent(mockProject, creatorUser);
            
            const buttonsContainer = document.querySelector('.buttons');
            expect(buttonsContainer).toBeInTheDocument();
            
            expect(buttonsContainer).toContainElement(screen.getByText('Edit Project'));
            expect(buttonsContainer).toContainElement(screen.getByText('Delete Project'));
            
            const rewardsContainer = document.querySelector('.reward-button').closest('div');
            expect(rewardsContainer).toBeInTheDocument();
        });
    });

    describe('edge cases', () => {
        it('handles different date formats in funding_end_date', () => {
            const projectWithSimpleDate = {
                ...mockProject,
                funding_end_date: '2024-12-25'
            };
            
            renderComponent(projectWithSimpleDate);
            
            expect(daysRemainingUntilEnd).toHaveBeenCalledWith('2024-12-25');
            expect(screen.getByText('2024-12-25', { exact: false })).toBeInTheDocument();
        });

        it('renders with different funding amounts', () => {
            const projectWithLargeAmount = {
                ...mockProject,
                funding_amount: 1000000
            };
            
            renderComponent(projectWithLargeAmount);
            
            expect(screen.getByText('$1000000')).toBeInTheDocument();
        });
    });
});