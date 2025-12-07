import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import GridItem from '../grid_item';

// Mock react-router-dom Link component for testing
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        Link: ({ to, children, ...props }) => (
            <a href={to} {...props} data-testid="link">
                {children}
            </a>
        )
    };
});

describe('GridItem', () => {
    const mockProject = {
        id: 123,
        title: 'Amazing Project',
        image_url: 'https://example.com/image.jpg',
        funding_amount: 50000
    };

    const renderGridItem = (project = mockProject) => {
        return render(
            <HashRouter>
                <GridItem project={project} />
            </HashRouter>
        );
    };

    it('renders without crashing', () => {
        renderGridItem();
        // Check for something that should always be present when project is defined
        expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('returns null when project is undefined', () => {
        const { container } = render(
            <HashRouter>
                <GridItem project={undefined} />
            </HashRouter>
        );
        
        // Component should render nothing
        expect(container.firstChild).toBeNull();
    });

    it('renders project image with correct src', () => {
        renderGridItem();
        
        const image = screen.getByRole('img');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', mockProject.image_url);
    });

    it('wraps image in a link to project detail page', () => {
        renderGridItem();
        
        const image = screen.getByRole('img');
        const imageLink = image.closest('a');
        
        expect(imageLink).toBeInTheDocument();
        expect(imageLink).toHaveAttribute('href', `/projects/${mockProject.id}`);
    });

    it('renders project title as a link', () => {
        renderGridItem();
        
        const titleLink = screen.getByText(mockProject.title);
        expect(titleLink).toBeInTheDocument();
        expect(titleLink.tagName).toBe('A');
        expect(titleLink).toHaveAttribute('href', `/projects/${mockProject.id}`);
    });

    it('renders project funding amount with correct formatting', () => {
        renderGridItem();
        
        const fundingText = screen.getByText(`$${mockProject.funding_amount} goal`);
        expect(fundingText).toBeInTheDocument();
        expect(fundingText).toHaveClass('project-funding');
    });

    it('renders project details container with correct class', () => {
        renderGridItem();
        
        const projectDetailDiv = screen.getByText(mockProject.title).closest('.project-detail');
        expect(projectDetailDiv).toBeInTheDocument();
        
        // Should contain both title link and funding span
        expect(projectDetailDiv).toContainElement(screen.getByText(mockProject.title));
        expect(projectDetailDiv).toContainElement(screen.getByText(`$${mockProject.funding_amount} goal`));
    });

    describe('project data variations', () => {
        it('handles different funding amounts', () => {
            const testCases = [
                { amount: 1000, expected: '$1000 goal' },
                { amount: 25000, expected: '$25000 goal' },
                { amount: 1000000, expected: '$1000000 goal' },
                { amount: 0, expected: '$0 goal' }
            ];
            
            testCases.forEach(({ amount, expected }) => {
                const project = { ...mockProject, funding_amount: amount };
                const { unmount } = render(
                    <HashRouter>
                        <GridItem project={project} />
                    </HashRouter>
                );
                
                expect(screen.getByText(expected)).toBeInTheDocument();
                unmount();
            });
        });

        it('handles different project titles', () => {
            const titles = [
                'Short Title',
                'Very Long Project Title That Might Wrap',
                'Project with Special Chars !@#$',
                'Project with Numbers 123'
            ];
            
            titles.forEach(title => {
                const project = { ...mockProject, title };
                const { unmount } = render(
                    <HashRouter>
                        <GridItem project={project} />
                    </HashRouter>
                );
                
                expect(screen.getByText(title)).toBeInTheDocument();
                expect(screen.getByText(title)).toHaveAttribute('href', `/projects/${mockProject.id}`);
                unmount();
            });
        });

        it('handles different image URLs', () => {
            const imageUrls = [
                'https://example.com/image1.jpg',
                '/local/path/to/image.png',
                'data:image/jpeg;base64,...',
                'https://cdn.example.com/projects/123/cover.jpg'
            ];
            
            imageUrls.forEach(imageUrl => {
                const project = { ...mockProject, image_url: imageUrl };
                const { unmount } = render(
                    <HashRouter>
                        <GridItem project={project} />
                    </HashRouter>
                );
                
                const image = screen.getByRole('img');
                expect(image).toHaveAttribute('src', imageUrl);
                unmount();
            });
        });

        it('handles different project IDs', () => {
            const ids = [1, 456, 9999, 123456];
            
            ids.forEach(id => {
                const project = { ...mockProject, id };
                const { unmount } = render(
                    <HashRouter>
                        <GridItem project={project} />
                    </HashRouter>
                );
                
                // Both links should use the correct ID
                const links = screen.getAllByRole('link');
                links.forEach(link => {
                    expect(link).toHaveAttribute('href', `/projects/${id}`);
                });
                unmount();
            });
        });
    });

    describe('component structure', () => {
        it('has correct parent container', () => {
            renderGridItem();
            
            // The outermost div
            const container = screen.getByRole('img').closest('div');
            expect(container).toBeInTheDocument();
            
            // Should contain image link and project detail div
            const imageLink = screen.getByRole('img').closest('a');
            const projectDetailDiv = screen.getByText(mockProject.title).closest('.project-detail');
            
            expect(container).toContainElement(imageLink);
            expect(container).toContainElement(projectDetailDiv);
        });

        it('has two links (image and title)', () => {
            renderGridItem();
            
            const links = screen.getAllByRole('link');
            expect(links).toHaveLength(2);
            
            // Both links should point to the same project page
            links.forEach(link => {
                expect(link).toHaveAttribute('href', `/projects/${mockProject.id}`);
            });
        });

        it('image has no alt text (could be improved for accessibility)', () => {
            renderGridItem();
            
            const image = screen.getByRole('img');
            // Note: This test reveals an accessibility issue - images should have alt text
            expect(image).not.toHaveAttribute('alt');
        });
    });

    describe('edge cases', () => {
        it('handles empty project object', () => {
            const emptyProject = {};
            const { container } = render(
                <HashRouter>
                    <GridItem project={emptyProject} />
                </HashRouter>
            );
            
            // Component renders but may have missing data
            // This depends on how your app handles missing data
            // Current implementation will throw errors trying to access undefined properties
        });
    });

    describe('accessibility considerations', () => {
        it('has descriptive link text for title', () => {
            renderGridItem();
            
            const titleLink = screen.getByText(mockProject.title);
            expect(titleLink).toHaveTextContent(mockProject.title);
            // Title should be meaningful on its own
        });

        it('links have clear destinations', () => {
            renderGridItem();
            
            const links = screen.getAllByRole('link');
            links.forEach(link => {
                expect(link).toHaveAttribute('href');
                expect(link.getAttribute('href')).toMatch(/^\/projects\/\d+$/);
            });
        });
    });

    describe('content formatting', () => {
        it('formats funding amount with dollar sign', () => {
            renderGridItem();
            
            const fundingText = screen.getByText(/goal$/);
            expect(fundingText.textContent).toMatch(/^\$\d+ goal$/);
        });

        it('does not add commas to funding amount', () => {
            const projectWithLargeAmount = {
                ...mockProject,
                funding_amount: 1000000
            };
            
            render(
                <HashRouter>
                    <GridItem project={projectWithLargeAmount} />
                </HashRouter>
            );
            
            // Current implementation doesn't add commas
            expect(screen.getByText('$1000000 goal')).toBeInTheDocument();
        });
    });
});