import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminBakeryModal from '../AdminBakeryModal'; // This imports the actual component

describe('AdminBakeryModal', () => {
  const mockSubmit = jest.fn();
  const mockCancel = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    mockSubmit.mockClear();
    mockCancel.mockClear();
  });

  test('renders correctly with initial empty fields', () => {
    render(<AdminBakeryModal onSubmit={mockSubmit} onCancel={mockCancel} />);
    expect(screen.getByLabelText(/Bakery Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Zip Code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Street Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Street Number/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });
  
  test('validates required fields correctly and shows error messages', async () => {
    render(<AdminBakeryModal onSubmit={mockSubmit} onCancel={mockCancel} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Create/i })); 
    
    screen.debug(undefined, 300000); // Log the DOM

    // Use findByText which includes waitFor
    expect(await screen.findByText("Bakery name is required")).toBeInTheDocument();
    expect(await screen.findByText("Zip code is required")).toBeInTheDocument();
    expect(await screen.findByText("Street name is required")).toBeInTheDocument();
    expect(await screen.findByText("Street number is required")).toBeInTheDocument();
    
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test('calls onCancel when cancel button is clicked', () => {
    render(<AdminBakeryModal onSubmit={mockSubmit} onCancel={mockCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });

  test('calls onSubmit with form data when form is valid and submitted', async () => {
    render(<AdminBakeryModal onSubmit={mockSubmit} onCancel={mockCancel} />);

    fireEvent.change(screen.getByLabelText(/Bakery Name/i), { target: { value: 'Test Bakery' } });
    fireEvent.change(screen.getByLabelText(/Zip Code/i), { target: { value: '1234' } }); // Corrected: 4-digit zip
    fireEvent.change(screen.getByLabelText(/Street Name/i), { target: { value: 'Main St' } });
    fireEvent.change(screen.getByLabelText(/Street Number/i), { target: { value: '101' } });

    fireEvent.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'Test Bakery',
        zipCode: '1234', // Corrected
        streetName: 'Main St',
        streetNumber: '101',
        imageUrl: '', 
        websiteUrl: '',
      });
    });
  });
  
  // Add more tests for other functionalities like editing, optional fields, etc.
});