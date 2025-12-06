import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TabBar from '../tab_bar';

describe('TabBar', () => {
    const mockCategories = {
        1: "Art",
        2: "Fashion", 
        3: "Film",
        4: "Food",
        5: "Games",
        6: "Technology"
    };

    const mockSelectCategory = vi.fn();

    const renderTabBar = (categories = mockCategories, selectCategory = mockSelectCategory) => {
        return render(
            <TabBar 
                categories={categories}
                selectCategory={selectCategory}
            />
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', () => {
        renderTabBar();
        expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('renders the container with correct class', () => {
        renderTabBar();
        const container = screen.getByRole('list').parentElement;
        expect(container).toHaveClass('tab-bar');
    });

    it('renders all categories as buttons', () => {
        renderTabBar();
        
        // Get all buttons
        const buttons = screen.getAllByRole('button');
        
        // Should have 6 buttons (one for each category)
        expect(buttons).toHaveLength(6);
        
        // Check each category text is present
        Object.values(mockCategories).forEach(category => {
            expect(screen.getByText(category)).toBeInTheDocument();
        });
    });

    it('renders the first category separately', () => {
        renderTabBar();
        
        const buttons = screen.getAllByRole('button');
        const firstButton = buttons[0];
        
        // First button should display the first category (Art)
        expect(firstButton).toHaveTextContent('Art');
        
        // First button should have id="1"
        expect(firstButton).toHaveAttribute('id', '1');
    });

    it('renders remaining categories in a loop', () => {
        renderTabBar();
        
        const buttons = screen.getAllByRole('button');
        
        // Skip first button (already tested)
        const remainingButtons = buttons.slice(1);
        
        // Should have 5 remaining buttons
        expect(remainingButtons).toHaveLength(5);
        
        // Check each remaining button has correct content and id
        remainingButtons.forEach((button, index) => {
            const expectedId = (index + 2).toString(); // IDs start from 2
            const expectedCategory = mockCategories[expectedId];
            
            expect(button).toHaveAttribute('id', expectedId);
            expect(button).toHaveTextContent(expectedCategory);
            expect(button).not.toHaveAttribute('autofocus');
        });
    });

    it('handles click events for all buttons', () => {
        renderTabBar();
        
        const buttons = screen.getAllByRole('button');
        
        // Click each button
        buttons.forEach((button, index) => {
            const expectedCategory = mockCategories[(index + 1).toString()];
            fireEvent.click(button);
            
            // Verify selectCategory was called with correct category
            expect(mockSelectCategory).toHaveBeenCalledWith(expectedCategory);
        });
        
        // Should have been called 6 times total
        expect(mockSelectCategory).toHaveBeenCalledTimes(6);
    });

    it('renders buttons as list items', () => {
        renderTabBar();
        
        const listItems = screen.getAllByRole('listitem');
        const buttons = screen.getAllByRole('button');
        
        // Should have same number of list items as buttons
        expect(listItems).toHaveLength(buttons.length);
        
        // Each list item should contain a button
        listItems.forEach((listItem, index) => {
            const button = listItem.querySelector('button');
            expect(button).toBeTruthy();
            expect(button).toBe(buttons[index]);
        });
    });

    it('handles categories with only one item', () => {
        const singleCategory = { 1: "Only Category" };
        renderTabBar(singleCategory);
        
        const buttons = screen.getAllByRole('button');
        
        // Should have 1 button
        expect(buttons).toHaveLength(1);
        expect(buttons[0]).toHaveTextContent("Only Category");
    });

    it('preserves button order based on category IDs', () => {
        // Test with categories in non-sequential order
        const unorderedCategories = {
            3: "Film",
            1: "Art", 
            5: "Games",
            2: "Fashion",
            4: "Food",
            6: "Technology"
        };
        
        renderTabBar(unorderedCategories);
        
        const buttons = screen.getAllByRole('button');
        
        // Buttons should be in ID order: 1, 2, 3, 4, 5, 6
        expect(buttons[0]).toHaveTextContent("Art");      // ID 1
        expect(buttons[1]).toHaveTextContent("Fashion");  // ID 2
        expect(buttons[2]).toHaveTextContent("Film");     // ID 3
        expect(buttons[3]).toHaveTextContent("Food");     // ID 4
        expect(buttons[4]).toHaveTextContent("Games");    // ID 5
        expect(buttons[5]).toHaveTextContent("Technology"); // ID 6
    });

    it('wraps selectCategory call in function for onClick', () => {
        // Create a spy to track what selectCategory returns
        const selectCategorySpy = vi.fn((category) => {
            // Return a function as the component expects
            return vi.fn(() => `selected: ${category}`);
        });
        
        renderTabBar(mockCategories, selectCategorySpy);
        
        const buttons = screen.getAllByRole('button');
        
        // Click first button
        fireEvent.click(buttons[0]);
        
        // selectCategory should have been called with "Art"
        expect(selectCategorySpy).toHaveBeenCalledWith("Art");
        
        // And it should have returned a function
        const returnedFunction = selectCategorySpy.mock.results[0].value;
        expect(typeof returnedFunction).toBe('function');
    });

    describe('button attributes', () => {
        it('sets correct id attributes', () => {
            renderTabBar();
            
            const buttons = screen.getAllByRole('button');
            
            buttons.forEach((button, index) => {
                const expectedId = (index + 1).toString();
                expect(button).toHaveAttribute('id', expectedId);
            });
        });
    });

    describe('list structure', () => {
        it('has exactly one ul element', () => {
            renderTabBar();
            
            const lists = document.getElementsByTagName('ul');
            expect(lists).toHaveLength(1);
        });

        it('ul is direct child of tab-bar div', () => {
            renderTabBar();
            
            const tabBarDiv = document.querySelector('.tab-bar');
            const list = screen.getByRole('list');
            
            expect(tabBarDiv).toContainElement(list);
            expect(list.parentElement).toBe(tabBarDiv);
        });

        it('each li contains exactly one button', () => {
            renderTabBar();
            
            const listItems = screen.getAllByRole('listitem');
            
            listItems.forEach(listItem => {
                const buttons = listItem.querySelectorAll('button');
                expect(buttons).toHaveLength(1);
            });
        });
    });

    it('has consistent structure', () => {
        const { container } = renderTabBar();
        
        const tabBarDiv = container.querySelector('.tab-bar');
        expect(tabBarDiv).toBeTruthy();
        
        const list = tabBarDiv.querySelector('ul');
        expect(list).toBeTruthy();
        
        const listItems = list.querySelectorAll('li');
        expect(listItems).toHaveLength(6);
        
        listItems.forEach(li => {
            expect(li.querySelector('button')).toBeTruthy();
        });
    });
});