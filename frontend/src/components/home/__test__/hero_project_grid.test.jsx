import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { HashRouter } from 'react-router-dom';

import HeroProjectGrid from '../hero_project_grid';
import GridItem from '../grid_item';

import { fetchProjects } from '../../../actions/project_actions';

// Mock dependencies
vi.mock('../../../actions/project_actions', () => ({
    fetchProjects: vi.fn(() => ({ type: 'FETCH_PROJECTS' }))
}));

// Mock GridItem (which is the same as HomePageItem)
vi.mock('../grid_item', () => ({
    default: vi.fn(({ project }) => {
        // Handle undefined/null project gracefully like the real component
        if (!project) return null;
        
        return (
            <div data-testid="grid-item" data-project-id={project.id}>
                <img src={project.image_url} alt="" />
                <div className="project-detail">
                    <a href={`/projects/${project.id}`}>{project.title}</a>
                    <span className="project-funding">${project.funding_amount} goal</span>
                </div>
            </div>
        );
    })
}));

// Mock useSelector and useDispatch
vi.mock('react-redux', async () => {
    const actual = await vi.importActual('react-redux');
    return {
        ...actual,
        useSelector: vi.fn(),
        useDispatch: vi.fn()
    };
});

describe('HeroProjectGrid', () => {
    let mockDispatch;
    let mockStore;
    
    // Sample project data matching your preloadedState structure
    const mockProjects = {
        1: { 
            id: 1, 
            title: 'Art Project 1', 
            category: 'Art', 
            funding_amount: 10000,
            image_url: '/images/project1.jpg'
        },
        2: { 
            id: 2, 
            title: 'Art Project 2', 
            category: 'Art', 
            funding_amount: 20000,
            image_url: '/images/project2.jpg'
        },
        3: { 
            id: 3, 
            title: 'Film Project 1', 
            category: 'Film', 
            funding_amount: 30000,
            image_url: '/images/project3.jpg'
        },
        4: { 
            id: 4, 
            title: 'Art Project 3', 
            category: 'Art', 
            funding_amount: 40000,
            image_url: '/images/project4.jpg'
        },
        5: { 
            id: 5, 
            title: 'Tech Project 1', 
            category: 'Technology', 
            funding_amount: 50000,
            image_url: '/images/project5.jpg'
        },
        6: { 
            id: 6, 
            title: 'Art Project 4', 
            category: 'Art', 
            funding_amount: 60000,
            image_url: '/images/project6.jpg'
        },
        7: { 
            id: 7, 
            title: 'Art Project 5', 
            category: 'Art', 
            funding_amount: 70000,
            image_url: '/images/project7.jpg'
        },
        8: { 
            id: 8, 
            title: 'Food Project 1', 
            category: 'Food', 
            funding_amount: 80000,
            image_url: '/images/project8.jpg'
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Setup mock dispatch
        mockDispatch = vi.fn();
        useDispatch.mockReturnValue(mockDispatch);
        
        // Create a mock store
        mockStore = configureStore({
            reducer: {
                entities: (state = { projects: {} }) => state
            }
        });
        
        // Default useSelector mock
        useSelector.mockImplementation((selector) => {
            const state = {
                entities: { projects: {} }
            };
            return selector(state);
        });
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    const renderHeroProjectGrid = (chosenCategory = 'Art', projectsState = mockProjects) => {
        // Mock useSelector to return specific projects
        useSelector.mockImplementation((selector) => {
            const state = {
                entities: { projects: projectsState }
            };
            return selector(state);
        });

        return render(
            <Provider store={mockStore}>
                <HashRouter>
                    <HeroProjectGrid chosenCategory={chosenCategory} />
                </HashRouter>
            </Provider>
        );
    };

    it('renders without crashing', () => {
        renderHeroProjectGrid();
        // Component renders but may return null initially
        // We'll test the actual rendering in other tests
    });

    it('dispatches fetchProjects on mount', () => {
        renderHeroProjectGrid();
        
        expect(fetchProjects).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'FETCH_PROJECTS' });
    });

    it('returns null when there are no projects', () => {
        // Mock empty projects
        useSelector.mockImplementation((selector) => {
            const state = {
                entities: { projects: {} }
            };
            return selector(state);
        });

        const { container } = render(
            <Provider store={mockStore}>
                <HashRouter>
                    <HeroProjectGrid chosenCategory="Art" />
                </HashRouter>
            </Provider>
        );

        // Should return null when projects object is empty
        expect(container.firstChild).toBeNull();
    });

    describe('project filtering by category', () => {
        it('displays up to 5 projects from chosen category', () => {
            renderHeroProjectGrid('Art');
            
            // Should display GridItem components for Art projects
            const gridItems = screen.getAllByTestId('grid-item');
            
            // We have 5 Art projects in mock data, so should display all 5
            expect(gridItems).toHaveLength(5);
            
            // Check they're the correct Art projects
            const displayedTitles = gridItems.map(item => 
                item.querySelector('.project-detail a').textContent
            );
            
            expect(displayedTitles).toContain('Art Project 1');
            expect(displayedTitles).toContain('Art Project 2');
            expect(displayedTitles).toContain('Art Project 3');
            expect(displayedTitles).toContain('Art Project 4');
            expect(displayedTitles).toContain('Art Project 5');
            
            // Should NOT display projects from other categories
            expect(displayedTitles).not.toContain('Film Project 1');
            expect(displayedTitles).not.toContain('Tech Project 1');
            expect(displayedTitles).not.toContain('Food Project 1');
        });

        it('displays fewer than 5 projects if category has fewer projects', () => {
            renderHeroProjectGrid('Film');
            
            // Only 1 Film project in mock data
            const gridItems = screen.getAllByTestId('grid-item');
            expect(gridItems).toHaveLength(1);
            
            const title = gridItems[0].querySelector('.project-detail a').textContent;
            expect(title).toBe('Film Project 1');
        });

        it('stops at 5 projects even if category has more', () => {
            // Add more Art projects to test the limit
            const manyArtProjects = {
                ...mockProjects,
                9: { id: 9, title: 'Art Project 6', category: 'Art', funding_amount: 90000, image_url: '/images/project9.jpg' },
                10: { id: 10, title: 'Art Project 7', category: 'Art', funding_amount: 100000, image_url: '/images/project10.jpg' },
                11: { id: 11, title: 'Art Project 8', category: 'Art', funding_amount: 110000, image_url: '/images/project11.jpg' }
            };
            
            renderHeroProjectGrid('Art', manyArtProjects);
            
            // Should still only display 5 projects
            const gridItems = screen.getAllByTestId('grid-item');
            expect(gridItems).toHaveLength(5);
        });
    });

    describe('layout structure', () => {
        it('renders main content and aside sections', () => {
            renderHeroProjectGrid('Art');
            
            // Using querySelector since getByClassName doesn't exist
            const content = document.querySelector('.content');
            const featuredContent = document.querySelector('.featured-content');
            const leftContent = document.querySelector('.left-content');
            const rightContent = document.querySelector('.right-content');
            const projectList = document.querySelector('.project-list');
            
            expect(content).toBeInTheDocument();
            expect(featuredContent).toBeInTheDocument();
            expect(leftContent).toBeInTheDocument();
            expect(rightContent).toBeInTheDocument();
            expect(projectList).toBeInTheDocument();
        });

        it('first project is in main featured section', () => {
            renderHeroProjectGrid('Art');
            
            const featuredSection = document.querySelector('.featured-content');
            const gridItemsInFeatured = featuredSection.querySelectorAll('[data-testid="grid-item"]');
            
            expect(gridItemsInFeatured).toHaveLength(1);
            expect(gridItemsInFeatured[0]).toHaveTextContent('Art Project 1');
        });

        it('remaining projects are in aside list', () => {
            renderHeroProjectGrid('Art');
            
            const projectList = document.querySelector('.project-list');
            const listItems = projectList.querySelectorAll('li');
            const gridItemsInList = projectList.querySelectorAll('[data-testid="grid-item"]');
            
            // Should have 4 list items (projects 2-5)
            expect(listItems).toHaveLength(4);
            expect(gridItemsInList).toHaveLength(4);
            
            // Check they're the correct projects
            const titles = Array.from(gridItemsInList).map(item => 
                item.querySelector('.project-detail a').textContent
            );
            
            expect(titles).toEqual([
                'Art Project 2',
                'Art Project 3', 
                'Art Project 4',
                'Art Project 5'
            ]);
        });

        it('project list is an unordered list', () => {
            renderHeroProjectGrid('Art');
            
            const ul = document.querySelector('.project-list ul');
            expect(ul).toBeInTheDocument();
            
            const listItems = ul.querySelectorAll('li');
            expect(listItems.length).toBeGreaterThan(0);
        });
    });

    describe('GridItem integration', () => {
        it('passes correct project data to GridItem components', () => {
            renderHeroProjectGrid('Art');
            
            // Check that GridItem was called with correct props
            expect(GridItem).toHaveBeenCalled();
            
            // Get all calls to GridItem
            const gridItemCalls = GridItem.mock.calls;
            
            // Should be called 5 times
            expect(gridItemCalls).toHaveLength(5);
            
            // Check each call receives correct project
            const expectedProjects = [
                mockProjects[1], // Art Project 1
                mockProjects[2], // Art Project 2
                mockProjects[4], // Art Project 3
                mockProjects[6], // Art Project 4
                mockProjects[7]  // Art Project 5
            ];
            
            expectedProjects.forEach((expectedProject, index) => {
                expect(gridItemCalls[index][0].project).toEqual(expectedProject);
            });
        });

        it('GridItem handles undefined projects gracefully', () => {
            // Test when we have fewer than 5 projects in a category
            renderHeroProjectGrid('Film');
            
            // GridItem should be called with the one Film project
            expect(GridItem).toHaveBeenCalledTimes(1);
            expect(GridItem.mock.calls[0][0].project).toEqual(mockProjects[3]);
        });
    });

    describe('category changes', () => {
        it('re-filters projects when chosenCategory changes', () => {
            const { rerender } = renderHeroProjectGrid('Art');
            
            // Initially shows Art projects
            let gridItems = screen.getAllByTestId('grid-item');
            expect(gridItems).toHaveLength(5);
            expect(gridItems[0]).toHaveTextContent('Art Project 1');
            
            // Clear mocks for GridItem to track new calls
            GridItem.mockClear();
            
            // Re-render with different category using rerender
            rerender(
                <Provider store={mockStore}>
                    <HashRouter>
                        <HeroProjectGrid chosenCategory="Technology" />
                    </HashRouter>
                </Provider>
            );
            
            // Now should show Technology project
            gridItems = screen.getAllByTestId('grid-item');
            expect(gridItems).toHaveLength(5);
            expect(gridItems[0]).toHaveTextContent('Tech Project 1');
            
            // GridItem should have been called with Technology project
            expect(GridItem).toHaveBeenCalledTimes(5);
            expect(GridItem.mock.calls[0][0].project).toEqual(mockProjects[5]);
        });
    });

    describe('performance and optimization', () => {
        it('only dispatches fetchProjects once on mount', () => {
            const { rerender } = renderHeroProjectGrid('Art');
            
            // Initial mount
            expect(fetchProjects).toHaveBeenCalledTimes(1);
            
            // Clear mock
            fetchProjects.mockClear();
            
            // Re-render with same props
            rerender(
                <Provider store={mockStore}>
                    <HashRouter>
                        <HeroProjectGrid chosenCategory="Art" />
                    </HashRouter>
                </Provider>
            );
            
            // Should NOT call fetchProjects again
            expect(fetchProjects).not.toHaveBeenCalled();
        });

        it('does not re-filter on re-render with same category', () => {
            // We can test this by checking if GridItem receives same props
            renderHeroProjectGrid('Art');
            
            const firstCallCount = GridItem.mock.calls.length;
            const firstProjectData = GridItem.mock.calls[0][0].project;
            
            // Clear and re-render
            GridItem.mockClear();
            renderHeroProjectGrid('Art');
            
            // Should have same number of calls
            expect(GridItem.mock.calls.length).toBe(firstCallCount);
            // Should pass same project data
            expect(GridItem.mock.calls[0][0].project).toEqual(firstProjectData);
        });
    });
});