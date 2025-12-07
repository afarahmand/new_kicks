// __tests__/discover_index_item.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';

// Component to test
import DiscoverIndexItem from '../discover_index_item.jsx';

// Mock the utility function
vi.mock('../../../utils/date_util', () => ({
    daysRemainingUntilEnd: vi.fn().mockReturnValue(15)
}));

// Import after mock
import { daysRemainingUntilEnd } from '../../../utils/date_util';

describe('DiscoverIndexItem', () => {
    // Mock project data
    const mockProject = {
        id: 123,
        title: 'Awesome Project',
        image_url: 'https://example.com/image.jpg',
        funding_amount: 50000,
        funding_end_date: '2024-12-31'
    };

    const renderComponent = (props = {}) => {
        return render(
            <HashRouter>
                <DiscoverIndexItem project={mockProject} {...props} />
            </HashRouter>
        );
    };

    it('renders project image with correct link', () => {
        renderComponent();
        
        const image = screen.getByRole('img');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', mockProject.image_url);
        
        // Check link wraps the image
        const imageLink = image.closest('a');
        expect(imageLink).toHaveAttribute('href', `#/projects/${mockProject.id}`);
    });

    it('renders project title with correct link', () => {
        renderComponent();
        
        const title = screen.getByText(mockProject.title);
        expect(title).toBeInTheDocument();
        expect(title).toHaveClass('project-title');
        
        // Check link wraps the title
        const titleLink = title.closest('a');
        expect(titleLink).toHaveAttribute('href', `#/projects/${mockProject.id}`);
    });

    it('renders funding goal', () => {
        renderComponent();
        
        const fundingText = screen.getByText(
            `$${mockProject.funding_amount} funding goal`
        );
        expect(fundingText).toBeInTheDocument();
        expect(fundingText).toHaveClass('goal');
    });

    it('renders days remaining using date utility', () => {
        renderComponent();
        
        // Check the utility function was called with correct date
        expect(daysRemainingUntilEnd).toHaveBeenCalledWith(mockProject.funding_end_date);
        
        // Check rendered days count
        const daysCount = screen.getByText('15');
        expect(daysCount).toBeInTheDocument();
        expect(daysCount).toHaveClass('days-to-go');
        
        // Check "days to go" text
        expect(screen.getByText('days to go')).toBeInTheDocument();
    });

    it('renders separating bar', () => {
        renderComponent();
        
        const separator = document.querySelector('.separating-bar');
        expect(separator).toBeInTheDocument();
    });

    it('has correct CSS classes on container elements', () => {
        renderComponent();
        
        const container = document.querySelector('.discover-item');
        expect(container).toBeInTheDocument();
        
        expect(document.querySelector('.discover-item-top')).toBeInTheDocument();
        expect(document.querySelector('.discover-item-middle')).toBeInTheDocument();
        expect(document.querySelector('.discover-item-bottom')).toBeInTheDocument();
    });

    // Edge case: different project data
    it('renders correctly with different project data', () => {
        const altProject = {
            id: 456,
            title: 'Another Project',
            image_url: 'https://example.com/other.jpg',
            funding_amount: 10000,
            funding_end_date: '2024-06-30'
        };
        
        render(
            <HashRouter>
                <DiscoverIndexItem project={altProject} />
            </HashRouter>
        );
        
        expect(screen.getByText(altProject.title)).toBeInTheDocument();
        expect(screen.getByRole('img')).toHaveAttribute('src', altProject.image_url);
        expect(screen.getByText(`$${altProject.funding_amount} funding goal`)).toBeInTheDocument();
        expect(daysRemainingUntilEnd).toHaveBeenCalledWith(altProject.funding_end_date);
    });
});