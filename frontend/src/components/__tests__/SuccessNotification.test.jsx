import React from 'react';
import { render, screen, act } from '@testing-library/react';
import Notification from '../SuccessNotification';

describe('SuccessNotification', () => {
  jest.useFakeTimers(); // Ensure fake timers are used for this suite

  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
  
  test('renders message with correct type', () => {
    render(
      <Notification 
        message="Test notification" 
        type="success" 
        isVisible={true} 
      />
    );
    
    const notification = screen.getByText('Test notification');
    expect(notification).toBeInTheDocument();
    expect(notification.closest('.notification')).toHaveClass('notification-success');
  });
  
  test('auto-hides after duration', () => {
    const mockOnClose = jest.fn();
    render(
      <Notification 
        message="Test notification" 
        isVisible={true} 
        duration={1000}
        onClose={mockOnClose} 
      />
    );
    
    expect(screen.getByText('Test notification')).toBeInTheDocument();
    
    act(() => { // Wrap timer advancement in act
      jest.advanceTimersByTime(1100); // Or jest.runAllTimers();
    });
    
    expect(mockOnClose).toHaveBeenCalled();
    expect(screen.queryByText('Test notification')).not.toBeInTheDocument(); 
  });
});