import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminBakeryModal from '../AdminBakeryModal';

describe('AdminBakeryModal', () => {
  const mockSubmit = jest.fn();
  const mockCancel = jest.fn();
  
  test('validates required fields correctly', async () => {
    render(<AdminBakeryModal onSubmit={mockSubmit} onCancel={mockCancel} />);
    
    // Submit empty form
    fireEvent.click(screen.getByText('Save'));
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText("Bakery name is required")).toBeInTheDocument();
      expect(screen.getByText("Zip code is required")).toBeInTheDocument();
      expect(screen.getByText("Street name is required")).toBeInTheDocument();
      expect(screen.getByText("Street number is required")).toBeInTheDocument();
    });
    
    // Verify submit wasn't called
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});