import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReviewModal from '../ReviewModal';
import { UserProvider } from '../../store/UserContext';

// Mock the API client
jest.mock('../../services/api', () => ({
  post: jest.fn().mockResolvedValue({ success: true }),
  get: jest.fn()
}));

describe('ReviewModal', () => {
  test('correctly switches between bakery and product review types', () => {
    const mockCurrentUser = { id: '1', username: 'testuser' };
    
    render(
      <UserProvider value={{ currentUser: mockCurrentUser }}>
        <MemoryRouter>
          <ReviewModal isOpen={true} onClose={() => {}} />
        </MemoryRouter>
      </UserProvider>
    );
    
    // Default should be bakery review
    expect(screen.getByText('Write a Bakery Review')).toBeInTheDocument();
    
    // Switch to product review
    fireEvent.click(screen.getByText('Product'));
    
    expect(screen.getByText('Write a Product Review')).toBeInTheDocument();
  });
});