import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatBar from '../stat_bar';

// Mock the date utility function
vi.mock('../../../utils/date_util', () => ({
    formatAsMonthDDYYYY: vi.fn()
}));

// Import after mocking
import { formatAsMonthDDYYYY } from '../../../utils/date_util';

describe('StatBar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default mock return value
        formatAsMonthDDYYYY.mockReturnValue('February 20, 2018');
    });

    const renderStatBar = () => {
        return render(<StatBar />);
    };

    it('renders the main container with correct classes', () => {
        renderStatBar();
        
        // Find the section element by its class
        const sections = document.getElementsByClassName('stat-bar');
        expect(sections.length).toBe(1);
        
        const section = sections[0];
        expect(section).toHaveClass('content-wide');
        expect(section.tagName).toBe('SECTION');
    });

    it('renders the list with correct classes', () => {
        renderStatBar();
        
        const lists = document.getElementsByClassName('content-narrow');
        expect(lists.length).toBe(1);
        
        const list = lists[0];
        expect(list.tagName).toBe('UL');
    });

    it('calls formatAsMonthDDYYYY with current date', () => {
        // Mock Date constructor to return a specific string
        const mockDateString = 'Mock Date String';
        const mockDateConstructor = vi.fn(() => mockDateString);
        const originalDate = global.Date;
        global.Date = mockDateConstructor;
        
        renderStatBar();
        
        expect(formatAsMonthDDYYYY).toHaveBeenCalledTimes(1);
        expect(formatAsMonthDDYYYY).toHaveBeenCalledWith(mockDateString);
        
        // Restore original Date
        global.Date = originalDate;
    });

    it('displays the formatted date from formatAsMonthDDYYYY', () => {
        // Test with different date formats
        const testCases = [
            'January 15, 2023',
            'March 1, 2024',
            'December 31, 2022'
        ];
        
        testCases.forEach(dateString => {
            vi.clearAllMocks();
            formatAsMonthDDYYYY.mockReturnValue(dateString);
            
            const { unmount } = render(<StatBar />);
            
            expect(screen.getByText(dateString)).toBeInTheDocument();
            expect(screen.getByText(dateString)).toHaveClass('stat-bar-title');
            
            unmount();
        });
    });

    it('displays the correct static text for each statistic', () => {
        renderStatBar();
        
        // Check all statistic titles
        expect(screen.getByText('Total Backers')).toBeInTheDocument();
        expect(screen.getByText('Funded Projects')).toBeInTheDocument();
        expect(screen.getByText('Live Projects')).toBeInTheDocument();
        
        // Check all statistic values
        expect(screen.getByText('14,168,977')).toBeInTheDocument();
        expect(screen.getByText('138,577')).toBeInTheDocument();
        expect(screen.getByText('3,843')).toBeInTheDocument();
        
        // Check the date description
        expect(screen.getByText('Bringing creative projects to life.')).toBeInTheDocument();
    });

    it('applies correct CSS classes to elements', () => {
        renderStatBar();
        
        // Check date title
        const dateTitle = screen.getByText('February 20, 2018');
        expect(dateTitle).toHaveClass('stat-bar-title');
        
        // Check date description
        const dateDescription = screen.getByText('Bringing creative projects to life.');
        expect(dateDescription).toHaveClass('stat-bar-body');
        
        // Check other statistic titles
        const statTitles = screen.getAllByText(/Total Backers|Funded Projects|Live Projects/);
        statTitles.forEach(title => {
            expect(title).toHaveClass('stat-bar-title');
        });
        
        // Check other statistic values
        const statValues = screen.getAllByText(/(14,168,977|138,577|3,843)/);
        statValues.forEach(value => {
            expect(value).toHaveClass('stat-bar-body');
        });
    });

    it('renders exactly 4 list items', () => {
        renderStatBar();
        
        // Get all list items (li elements)
        const listItems = document.querySelectorAll('li');
        expect(listItems.length).toBe(4);
    });

    it('each list item contains a div with title and body spans', () => {
        renderStatBar();
        
        const listItems = document.querySelectorAll('li');
        
        listItems.forEach((item, index) => {
            const div = item.querySelector('div');
            expect(div).toBeTruthy();
            
            const titleSpans = div.querySelectorAll('.stat-bar-title');
            const bodySpans = div.querySelectorAll('.stat-bar-body');
            
            expect(titleSpans.length).toBe(1);
            expect(bodySpans.length).toBe(1);
        });
    });

    it('has the correct structure for the first list item (date)', () => {
        renderStatBar();
        
        const listItems = document.querySelectorAll('li');
        const firstItem = listItems[0];
        
        const titleSpan = firstItem.querySelector('.stat-bar-title');
        const bodySpan = firstItem.querySelector('.stat-bar-body');
        
        expect(titleSpan).toHaveTextContent('February 20, 2018');
        expect(bodySpan).toHaveTextContent('Bringing creative projects to life.');
    });

    it('has the correct order of statistics', () => {
        renderStatBar();
        
        const listItems = document.querySelectorAll('li');
        
        // First item: Date
        expect(listItems[0]).toHaveTextContent('February 20, 2018');
        expect(listItems[0]).toHaveTextContent('Bringing creative projects to life.');
        
        // Second item: Total Backers
        expect(listItems[1]).toHaveTextContent('Total Backers');
        expect(listItems[1]).toHaveTextContent('14,168,977');
        
        // Third item: Funded Projects
        expect(listItems[2]).toHaveTextContent('Funded Projects');
        expect(listItems[2]).toHaveTextContent('138,577');
        
        // Fourth item: Live Projects
        expect(listItems[3]).toHaveTextContent('Live Projects');
        expect(listItems[3]).toHaveTextContent('3,843');
    });

    it('handles date formatting function returning empty string', () => {
        formatAsMonthDDYYYY.mockReturnValue('');
        renderStatBar();
        
        // The component should still render without crashing
        const dateTitle = document.querySelector('.stat-bar-title');
        expect(dateTitle).toBeTruthy();
        expect(dateTitle).toHaveTextContent('');
    });

    it('updates when date utility returns different value', () => {
        const { rerender } = renderStatBar();
        
        // Initial render
        expect(screen.getByText('February 20, 2018')).toBeInTheDocument();
        
        // Change mock and re-render
        formatAsMonthDDYYYY.mockReturnValue('March 15, 2023');
        rerender(<StatBar />);
        
        expect(screen.getByText('March 15, 2023')).toBeInTheDocument();
        expect(formatAsMonthDDYYYY).toHaveBeenCalledTimes(2);
    });

    describe('static content verification', () => {
        it('has consistent number formatting with commas', () => {
            renderStatBar();
            
            const numbers = ['14,168,977', '138,577', '3,843'];
            numbers.forEach(number => {
                const element = screen.getByText(number);
                expect(element).toBeInTheDocument();
                expect(element).toHaveClass('stat-bar-body');
            });
        });

        it('has consistent text for descriptions', () => {
            renderStatBar();
            
            const texts = [
                'Bringing creative projects to life.',
                'Total Backers',
                'Funded Projects',
                'Live Projects'
            ];
            
            texts.forEach(text => {
                expect(screen.getByText(text)).toBeInTheDocument();
            });
        });
    });
});