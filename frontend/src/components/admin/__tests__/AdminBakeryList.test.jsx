import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BakeryList from '../AdminBakeryList';

describe('BakeryList Component', () => {
  const mockBakeries = [
    { id: '1', name: 'Test Bakery', zipCode: '1234', streetName: 'Test St', streetNumber: '123' },
    { id: '2', name: 'Another Bakery', zipCode: '5678', streetName: 'Bakery Lane', streetNumber: '45' }
  ];
  
  const mockEditFn = jest.fn();
  const mockDeleteFn = jest.fn();
  
  test('renders empty state when no bakeries', () => {
    render(<BakeryList bakeries={[]} onEdit={mockEditFn} onDelete={mockDeleteFn} />);
    expect(screen.getByText(/no bakeries found/i)).toBeInTheDocument();
  });
  
  test('renders bakery data correctly', () => {
    render(<BakeryList bakeries={mockBakeries} onEdit={mockEditFn} onDelete={mockDeleteFn} />);
    
    expect(screen.getByText('Test Bakery')).toBeInTheDocument();
    expect(screen.getByText('Another Bakery')).toBeInTheDocument();
  });
});

// babel.config.cjs
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }]
  ]
};