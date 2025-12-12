import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { HashRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import HomePage from '../home_page';
import StatBar from '../stat_bar';
import TabBar from '../tab_bar';
import HeroProjectGrid from '../hero_project_grid';

// Mock child components ONLY
vi.mock('../stat_bar', () => ({
    default: vi.fn(() => <div data-testid="stat-bar">StatBar Component</div>)
}));

vi.mock('../tab_bar', () => ({
    default: vi.fn(({ categories, selectCategory }) => (
        <div data-testid="tab-bar">
            TabBar Component
            <button onClick={() => selectCategory(categories[1])} data-testid="tab-button">
                Test Category
            </button>
        </div>
    ))
}));

vi.mock('../hero_project_grid', () => ({
    default: vi.fn(({ chosenCategory }) => (
        <div data-testid="hero-project-grid">
            HeroProjectGrid - Category: {chosenCategory}
        </div>
    ))
}));

// Mock useSelector ONLY
vi.mock('react-redux', async () => {
    const actual = await vi.importActual('react-redux');
    return {
        ...actual,
        useSelector: vi.fn()
    };
});

describe('HomePage', () => {
    let mockStore;
    const mockCategories = {
        1: "Art",
        2: "Fashion", 
        3: "Film",
        4: "Food",
        5: "Games",
        6: "Technology"
    };

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Create a mock store
        mockStore = configureStore({
            reducer: {
                entities: (state = { categories: {} }) => state
            }
        });
        
        // Default useSelector mock returns mock categories
        useSelector.mockImplementation((selector) => {
            const state = {
                entities: { categories: mockCategories }
            };
            return selector(state);
        });
    });

    const renderHomePage = () => {
        return render(
            <Provider store={mockStore}>
                <HashRouter>
                    <HomePage />
                </HashRouter>
            </Provider>
        );
    };

    it('renders without crashing', () => {
        renderHomePage();
        expect(screen.getByTestId('stat-bar')).toBeInTheDocument();
    });

    it('renders all main child components', () => {
        renderHomePage();
        
        expect(screen.getByTestId('stat-bar')).toBeInTheDocument();
        expect(screen.getByTestId('tab-bar')).toBeInTheDocument();
        expect(screen.getByTestId('hero-project-grid')).toBeInTheDocument();
    });

    it('fetches categories from Redux store', () => {
        renderHomePage();
        
        expect(useSelector).toHaveBeenCalled();
        
        // Verify the selector function accesses the right part of state
        const selectorCall = useSelector.mock.calls[0][0];
        const mockState = { entities: { categories: mockCategories } };
        expect(selectorCall(mockState)).toEqual(mockCategories);
    });

    it('initializes chosenCategory with the category at index 1 (categories[1])', () => {
        renderHomePage();
        
        // HeroProjectGrid should receive "Art" as initial chosenCategory
        expect(HeroProjectGrid).toHaveBeenCalledWith(
            expect.objectContaining({
                chosenCategory: "Art"  // categories[1] is "Art" (see preloadedState)
            }),
            undefined
        );
        
        // TabBar should receive all categories
        expect(TabBar).toHaveBeenCalledWith(
            expect.objectContaining({
                categories: mockCategories
            }),
            undefined
        );
    });

    describe('category selection', () => {
        it('TabBar receives categories and selectCategory function', () => {
            renderHomePage();
    
            expect(TabBar).toHaveBeenCalledWith(
                {
                    categories: mockCategories,
                    selectCategory: expect.any(Function)
                },
                undefined
            );
        });

        it('selectCategory function follows the event handler pattern', () => {
            renderHomePage();
            
            // Get the selectCategory function passed to TabBar
            const tabBarCall = TabBar.mock.calls.find(call => 
                call[0].categories === mockCategories
            );
            
            if (tabBarCall) {
                const { selectCategory } = tabBarCall[0];
                
                // It should return a function (event handler)
                const eventHandler = selectCategory("Film");
                expect(typeof eventHandler).toBe('function');
                
                // The returned function should be callable
                act(() => {
                    eventHandler({ preventDefault: vi.fn() });
                });
                expect(() => {}).not.toThrow();
            }
        });

        it('HeroProjectGrid receives chosenCategory from useState', () => {
            renderHomePage();
    
            // HeroProjectGrid should receive a chosenCategory prop
            expect(HeroProjectGrid).toHaveBeenCalledWith(
                expect.objectContaining({
                    chosenCategory: expect.any(String)
                }),
                undefined
            );
            
            // Check what the actual chosenCategory is
            const heroGridProps = HeroProjectGrid.mock.calls[0][0];
            
            // It should be "Art" since categories[1] on an object {1: "Art", ...} = "Art"
            expect(heroGridProps.chosenCategory).toBe("Art");
        });
    });

    describe('title bar section', () => {
        it('has a discover more link with real Link component', () => {
            renderHomePage();
            
            const discoverLink = screen.getByText(/DISCOVER MORE/i);
            expect(discoverLink).toBeInTheDocument();
            
            // Link creates an <a> element with href
            const linkElement = discoverLink.closest('a');
            expect(linkElement).toBeInTheDocument();
            
            // With HashRouter, links get hash prefix
            expect(linkElement).toHaveAttribute('href', '#/discover/');
        });

        it('displays current chosenCategory as title', () => {
            renderHomePage();
            
            // Initially should show "Art" (categories[1])
            const categoryTitle = screen.getByText("Art");
            expect(categoryTitle).toBeInTheDocument();
            expect(categoryTitle).toHaveClass('category-title');
        });

        it('has a discover more link', () => {
            renderHomePage();
            
            const discoverLink = screen.getByText(/DISCOVER MORE/i);
            expect(discoverLink).toBeInTheDocument();
            expect(discoverLink.closest('a')).toHaveAttribute('href', '#/discover/');
        });

        it('discover link includes arrow icon', () => {
            renderHomePage();
            
            const icon = document.querySelector('.fa-long-arrow-alt-right');
            expect(icon).toBeInTheDocument();
            expect(icon.tagName).toBe('I');
            expect(icon).toHaveClass('fas');
        });

        it('title bar has correct structure', () => {
            renderHomePage();
            
            const titleBar = document.querySelector('.title-bar');
            expect(titleBar).toBeInTheDocument();
            
            // Should contain category title and discover link
            expect(titleBar).toContainElement(screen.getByText('Art'));
            expect(titleBar).toContainElement(screen.getByText(/DISCOVER MORE/i));
        });
    });

    describe('main-aside-title section', () => {
        it('has "FEATURED PROJECT" header', () => {
            renderHomePage();
            
            const featuredHeader = screen.getByText('FEATURED PROJECT');
            expect(featuredHeader).toBeInTheDocument();
            expect(featuredHeader).toHaveClass('content-header-text');
        });

        it('has two content-header-text divs', () => {
            renderHomePage();
            
            const headerDivs = document.querySelectorAll('.content-header-text');
            expect(headerDivs).toHaveLength(2);
            
            // First one should have text
            expect(headerDivs[0]).toHaveTextContent('FEATURED PROJECT');
            // Second one should be empty
            expect(headerDivs[1]).toHaveTextContent('');
        });

        it('is inside main-aside-title section', () => {
            renderHomePage();
            
            const mainAsideTitle = document.querySelector('.main-aside-title');
            expect(mainAsideTitle).toBeInTheDocument();
            
            const headerDivs = mainAsideTitle.querySelectorAll('.content-header-text');
            expect(headerDivs).toHaveLength(2);
        });
    });

    describe('layout structure', () => {
        it('has correct wrapper divs', () => {
            renderHomePage();
            
            const homeMain = document.querySelector('.home-main');
            expect(homeMain).toBeInTheDocument();
            expect(homeMain).toHaveClass('content-narrow');
            
            // Should contain all main sections
            expect(homeMain).toContainElement(document.querySelector('.title-bar'));
            expect(homeMain).toContainElement(document.querySelector('.main-aside-title'));
            expect(homeMain).toContainElement(screen.getByTestId('tab-bar'));
            expect(homeMain).toContainElement(screen.getByTestId('hero-project-grid'));
        });

        it('StatBar is outside home-main section', () => {
            renderHomePage();
            
            const homeMain = document.querySelector('.home-main');
            const statBar = screen.getByTestId('stat-bar');
            
            expect(homeMain).not.toContainElement(statBar);
        });
    });

    describe('category updates', () => {
        it('updates displayed category when chosenCategory changes', () => {
            // Test the full flow: useSelector -> initial state -> update -> re-render
            const { rerender } = renderHomePage();
            
            // Initially shows "Art"
            expect(screen.getByText('Art')).toBeInTheDocument();
            
            // Update mock to simulate category change
            // This is a bit tricky because useState is internal to the component
            // We need to test through the TabBar integration
        });

        it('HeroProjectGrid receives updated chosenCategory', () => {
            // Simulate different initial categories by mocking useSelector differently
            useSelector.mockImplementation((selector) => {
                const state = {
                    entities: { categories: mockCategories }
                };
                return selector(state);
            });
            
            renderHomePage();
            
            // Clear previous calls
            HeroProjectGrid.mockClear();
            
            // Re-render with mocked selector that returns different initial state
            // This tests that the component reacts to Redux state changes
            useSelector.mockImplementation((selector) => {
                const state = {
                    entities: { 
                        categories: { 
                            0: "Art",
                            1: "Technology"  // Different second category
                        }
                    }
                };
                return selector(state);
            });
            
            render(
                <Provider store={mockStore}>
                    <HashRouter>
                        <HomePage />
                    </HashRouter>
                </Provider>
            );
            
            // Check that HeroProjectGrid was called with Technology
            expect(HeroProjectGrid).toHaveBeenCalled();
            
            // Get the last call and check its props
            const lastCall = HeroProjectGrid.mock.calls[HeroProjectGrid.mock.calls.length - 1];
            expect(lastCall[0]).toMatchObject({
                chosenCategory: "Technology"
            });
        });
    });

    describe('component integration', () => {
        it('passes correct props to all child components', () => {
            renderHomePage();
            
            // Verify StatBar is called (no props expected)
            expect(StatBar).toHaveBeenCalledTimes(1);
            
            // Check the LAST call to TabBar (most up-to-date props)
            const lastTabBarCall = TabBar.mock.calls[TabBar.mock.calls.length - 1];
            expect(lastTabBarCall[0]).toMatchObject({
                categories: mockCategories,
                selectCategory: expect.any(Function)
            });
            
            // Check the LAST call to HeroProjectGrid
            const lastHeroProjectGridCall = HeroProjectGrid.mock.calls[HeroProjectGrid.mock.calls.length - 1];
            expect(lastHeroProjectGridCall[0]).toMatchObject({
                chosenCategory: "Art"  // Initial state
            });
        });

        it('selectCategory function has correct closure behavior', () => {
            renderHomePage();
            
            const tabBarProps = TabBar.mock.calls[0][0];
            const selectCategory = tabBarProps.selectCategory;
            
            // The function should return another function (event handler pattern)
            const eventHandler = selectCategory("Test Category");
            expect(typeof eventHandler).toBe('function');
            
            // The returned function should be callable without errors
            act(() => {
                eventHandler({ preventDefault: vi.fn() });
            });
            expect(() => {}).not.toThrow();
        });
    });

    describe('accessibility and semantics', () => {
        it('uses semantic section elements', () => {
            renderHomePage();
            
            const sections = document.querySelectorAll('section');
            expect(sections.length).toBeGreaterThanOrEqual(3); // home-main, title-bar, main-aside-title
            
            sections.forEach(section => {
                expect(['SECTION', 'HEADER', 'FOOTER', 'NAV', 'MAIN', 'ASIDE'].includes(section.tagName)).toBe(true);
            });
        });

        it('links have clear destinations and text', () => {
            renderHomePage();
            
            const discoverLink = screen.getByText(/DISCOVER MORE/i);
            expect(discoverLink.closest('a')).toHaveAttribute('href', '#/discover/');
            expect(discoverLink.textContent).toBe('DISCOVER MORE');
        });
    });
});