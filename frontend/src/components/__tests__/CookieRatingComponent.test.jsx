import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CookieRatingComponent from '../CookieRatingComponent';

describe('CookieRating Component', () => {
  const mockOnChange = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders correct number of cookies based on max prop', () => {
    render(<CookieRatingComponent rating={0} onChange={mockOnChange} max={5} />);
    
    const cookies = screen.getAllByText('🍪');
    expect(cookies).toHaveLength(5);
  });
  
  test('displays correct rating value', () => {
    render(<CookieRatingComponent rating={7} onChange={mockOnChange} max={5} />);
    
    // Rating 7 on a scale of 10 should display as 3.5/5
    expect(screen.getByText('3.5/5')).toBeInTheDocument();
  });
  
  test('clicking a cookie triggers onChange with correct value', () => {
    render(<CookieRatingComponent rating={0} onChange={mockOnChange} max={5} />);
    
    // Click the third cookie
    const cookies = screen.getAllByText('🍪');
    fireEvent.click(cookies[2]);
    
    // Should call onChange with 6 (as the backend expects 1-10 scale)
    expect(mockOnChange).toHaveBeenCalledWith(6);
  });
  
  test('clicking left side of cookie selects half rating', () => {
    render(<CookieRatingComponent rating={0} onChange={mockOnChange} max={5} />);
    
    // Get the click zones
    const cookieWrappers = screen.getAllByRole('button');
    const secondCookieWrapper = cookieWrappers[1];
    
    // Mock getBoundingClientRect
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 30,
      left: 0
    }));
    
    // Click on the left side of the cookie
    fireEvent.mouseMove(secondCookieWrapper, { 
      clientX: 10  // Less than half of the 30px width
    });
    fireEvent.click(secondCookieWrapper);
    
    // Restore the original function
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    
    // Should call onChange with 3 (as the backend expects 1-10 scale)
    expect(mockOnChange).toHaveBeenCalledWith(3);
  });
  
  test('disabled rating does not allow interaction', () => {
    render(<CookieRatingComponent rating={6} onChange={mockOnChange} max={5} disabled={true} />);
    
    const cookies = screen.getAllByText('🍪');
    fireEvent.click(cookies[2]);
    
    // onChange should not be called
    expect(mockOnChange).not.toHaveBeenCalled();
  });
  
  test('hovering updates the display without triggering onChange', () => {
    const mockOnChange = jest.fn();
    render(<CookieRatingComponent onChange={mockOnChange} initialRating={0} />);
    
    const cookieWrappers = screen.getAllByRole('button', { name: /Rate between/i });
    expect(cookieWrappers.length).toBe(5);

    const fourthCookie = cookieWrappers[3]; // Target the 4th cookie (index 3)
    const rect = fourthCookie.getBoundingClientRect();

    // Simulate mouse moving over the right half of the 4th cookie
    fireEvent.mouseMove(fourthCookie, { 
      clientX: rect.left + (rect.width * 0.75) // Position cursor on the right side
    });

    // Check that 4/5 is displayed (or "4 / 5" depending on your component's formatting)
    // Let's try a flexible matcher if spacing is an issue
    expect(screen.getByText((content, element) => content.startsWith('4') && content.includes('/') && content.endsWith('5'))).toBeInTheDocument();
    
    expect(mockOnChange).not.toHaveBeenCalled();

    // Simulate mouse leaving to reset hover state
    fireEvent.mouseLeave(fourthCookie);
    // Check if it resets to the initial display (0/5 or as per initialRating)
    expect(screen.getByText((content, element) => content.startsWith('0') && content.includes('/') && content.endsWith('5'))).toBeInTheDocument();
  });
  
  test('can hide rating value', () => {
    render(<CookieRatingComponent rating={6} onChange={mockOnChange} max={5} showValue={false} />);
    
    // The rating value should not be in the document
    expect(screen.queryByText('3.0/5')).not.toBeInTheDocument();
  });
});