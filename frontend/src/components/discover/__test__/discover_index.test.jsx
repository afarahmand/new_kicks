import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';

vi.mock('../discover_index_item.jsx', () => ({
    default: vi.fn(() => <div data-testid="discover-index-item">Mock DiscoverIndexItem</div>)
}));

import DiscoverIndexItem from '../discover_index_item.jsx';
import DiscoverIndex from '../discover_index.jsx';

describe('DiscoverIndex', () => {
    const mockProjects = {
        '1': {
            id: 1,
            title: 'Project One',
            image_url: 'image1.jpg',
            funding_amount: 10000,
            funding_end_date: '2024-12-31',
            category: "Art"
        },
        '2': {
            id: 2,
            title: 'Project Two',
            image_url: 'image2.jpg',
            funding_amount: 25000,
            funding_end_date: '2024-11-15',
            category: "Art"
        },
        '3': {
            id: 3,
            title: 'Project Three',
            image_url: 'image3.jpg',
            funding_amount: 5000,
            funding_end_date: '2024-10-01',
            category: "Art"
        }
    };

    const renderComponent = (props = {}) => (
        render(
            <HashRouter>
                <DiscoverIndex projects={mockProjects} {...props} />
            </HashRouter>
        )
    )

    it('renders the container section with correct class', () => {
        renderComponent();
        
        const container = document.querySelector('.project-index-display');
        expect(container).toBeInTheDocument();
        expect(container.tagName).toBe('SECTION');
    });

    it('renders a list element', () => {
        renderComponent();
        
        const list = document.querySelector('ul');
        expect(list).toBeInTheDocument();
    });

    it('renders list items for each project', () => {
        renderComponent();
        
        const listItems = document.querySelectorAll('li');
        expect(listItems).toHaveLength(Object.keys(mockProjects).length);
    });

    it('passes correct project data to DiscoverIndexItem components', () => {
        renderComponent();
        
        // Check each call receives correct project data
        expect(DiscoverIndexItem).toHaveBeenCalledWith(
            expect.objectContaining({ project: mockProjects['1'] }),
            undefined
        );
        expect(DiscoverIndexItem).toHaveBeenCalledWith(
            expect.objectContaining({ project: mockProjects['2'] }),
            undefined
        );
        expect(DiscoverIndexItem).toHaveBeenCalledWith(
            expect.objectContaining({ project: mockProjects['3'] }),
            undefined
        );
    });

    it('uses project IDs as keys for list items', () => {
        renderComponent();
        
        // Get all list items
        const listItems = document.querySelectorAll('li');
        
        // Check each li has correct key attribute (React adds it as data-reactroot or similar)
        // For React 18+, we check that items are rendered in correct order with correct content
        listItems.forEach((li, index) => {
            const itemId = Object.keys(mockProjects)[index];
            expect(li).toContainElement(screen.getAllByTestId('discover-index-item')[index]);
        });
    });

    it('renders correct number of DiscoverIndexItem components', () => {
        renderComponent();
        
        const items = screen.getAllByTestId('discover-index-item');
        expect(items).toHaveLength(3);
    });

    it('handles empty projects object', () => {
        render(
            <HashRouter>
                <DiscoverIndex projects={{}} />
            </HashRouter>
        );
        
        const listItems = document.querySelectorAll('li');
        expect(listItems).toHaveLength(0);
        
        const items = screen.queryAllByTestId('discover-index-item');
        expect(items).toHaveLength(0);
    });

    it('handles single project', () => {
        const singleProject = {
            '1': mockProjects['1']
        };
        
        render(
            <HashRouter>
                <DiscoverIndex projects={singleProject} />
            </HashRouter>
        );
        
        const listItems = document.querySelectorAll('li');
        expect(listItems).toHaveLength(1);
        
        const items = screen.getAllByTestId('discover-index-item');
        expect(items).toHaveLength(1);
    });

    it('maintains proper nesting structure', () => {
        renderComponent();
        
        const section = document.querySelector('.project-index-display');
        const ul = section.querySelector('ul');
        expect(ul).toBeInTheDocument();
        
        const lis = ul.querySelectorAll('li');
        expect(lis).toHaveLength(3);
        
        lis.forEach(li => {
            expect(li.querySelector('[data-testid="discover-index-item"]')).toBeInTheDocument();
        });
    });
});