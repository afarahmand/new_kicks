import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

// Component to test
import TitleSection from '../title_section.jsx';

describe('TitleSection', () => {
    // Mock project data
    const mockProject = {
        id: 123,
        user_id: 456,
        title: 'Amazing Project',
        short_blurb: 'A short description of the amazing project'
    };

    // Mock creator/user data
    const mockCreator = {
        id: 456,
        name: 'John Doe',
        image_url: 'https://example.com/avatar.jpg'
    };

    // Mock store creator
    const createMockStore = (usersState = {}) => {
        return configureStore({
            reducer: {
                entities: (state = { users: usersState }) => state
            }
        });
    };

    const renderComponent = (project = mockProject, creator = mockCreator) => {
        const store = createMockStore({ [creator.id]: creator });
        
        return render(
            <Provider store={store}>
                <HashRouter>
                    <TitleSection project={project} />
                </HashRouter>
            </Provider>
        );
    };

    describe('when creator exists in store', () => {
        it('renders creator section with link', () => {
            renderComponent();
            
            const creatorSection = document.querySelector('.creator');
            expect(creatorSection).toBeInTheDocument();
            
            const link = screen.getByRole('link', { name: /By John Doe/i });
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute('href', `#/users/${mockCreator.id}`);
        });

        it('renders creator avatar image', () => {
            renderComponent();
            
            const image = screen.getByRole('img', { name: '' });
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute('src', mockCreator.image_url);
        });

        it('renders "By {creator.name}" text', () => {
            renderComponent();
            
            const byText = screen.getByText(`By ${mockCreator.name}`);
            expect(byText).toBeInTheDocument();
        });

        it('renders project title', () => {
            renderComponent();
            
            const title = screen.getByRole('heading', { level: 2 });
            expect(title).toBeInTheDocument();
            expect(title).toHaveTextContent(mockProject.title);
        });

        it('renders project short blurb', () => {
            renderComponent();
            
            const blurb = screen.getByText(mockProject.short_blurb);
            expect(blurb).toBeInTheDocument();
            expect(blurb).toHaveClass('subtitle');
        });

        it('has correct container structure', () => {
            renderComponent();
            
            const section = document.querySelector('.title');
            expect(section).toBeInTheDocument();
            
            expect(document.querySelector('.titles')).toBeInTheDocument();
            expect(document.querySelector('.creator')).toBeInTheDocument();
        });
    });

    describe('when creator does NOT exist in store', () => {
        it('returns null when creator is undefined', () => {
            const store = createMockStore({}); // Empty users object
            
            const { container } = render(
                <Provider store={store}>
                    <HashRouter>
                        <TitleSection project={mockProject} />
                    </HashRouter>
                </Provider>
            );
            
            // Should render nothing (null)
            expect(container.firstChild).toBeNull();
        });

        it('returns null when user_id does not exist in users state', () => {
            const store = createMockStore({
                999: { id: 999, name: 'Different User' } // Different ID
            });
            
            const { container } = render(
                <Provider store={store}>
                    <HashRouter>
                        <TitleSection project={mockProject} />
                    </HashRouter>
                </Provider>
            );
            
            expect(container.firstChild).toBeNull();
        });
    });

    describe('with different project data', () => {
        it('renders correctly with different creator', () => {
            const differentCreator = {
                id: 789,
                name: 'Jane Smith',
                image_url: 'https://example.com/jane.jpg'
            };
            
            const differentProject = {
                id: 999,
                user_id: 789,
                title: 'Different Project',
                short_blurb: 'Another description'
            };
            
            const store = createMockStore({ [differentCreator.id]: differentCreator });
            
            render(
                <Provider store={store}>
                    <HashRouter>
                        <TitleSection project={differentProject} />
                    </HashRouter>
                </Provider>
            );
            
            expect(screen.getByText('By Jane Smith')).toBeInTheDocument();
            expect(screen.getByText('Different Project')).toBeInTheDocument();
            expect(screen.getByText('Another description')).toBeInTheDocument();
            
            const link = screen.getByRole('link');
            expect(link).toHaveAttribute('href', `#/users/${differentCreator.id}`);
        });
    });

    describe('link behavior', () => {
        it('links to correct user profile page', () => {
            renderComponent();
            
            const link = screen.getByRole('link');
            expect(link).toHaveAttribute('href', `#/users/${mockCreator.id}`);
        });

        it('wraps both image and text in the same link', () => {
            renderComponent();
            
            const link = screen.getByRole('link');
            const image = link.querySelector('img');
            const text = link.querySelector('span');
            
            expect(image).toBeInTheDocument();
            expect(text).toBeInTheDocument();
            expect(text).toHaveTextContent(`By ${mockCreator.name}`);
        });
    });
});