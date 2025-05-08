import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NavBar from '../NavBar';
import { UserProvider } from '../../store/UserContext';
import * as router from 'react-router-dom';

// Mock the ReviewModal component
jest.mock('../ReviewModal', () => {
  return function MockReviewModal({ isOpen, onClose }) {
    return isOpen ? (
      <div data-testid="review-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null;
  };
});

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/test-path' })
}));

// Helper function to render with providers
const renderNavBar = (currentUser = null) => {
  const mockUserContext = {
    currentUser,
    logout: jest.fn(),
    isLoading: false
  };
  
  return render(
    <UserProvider value={mockUserContext}>
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    </UserProvider>
  );
};

describe('NavBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders logo and navigation links', () => {
    renderNavBar();
    
    expect(screen.getByText('CrumbCompass')).toBeInTheDocument();
    expect(screen.getByText('Bakery Rankings')).toBeInTheDocument();
    expect(screen.getByText('Product Rankings')).toBeInTheDocument();
  });
  
  test('shows login and signup buttons when user is not logged in', () => {
    renderNavBar();
    
    expect(screen.getByText('Log in')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });
  
  test('shows profile icon when user is logged in', () => {
    renderNavBar({ id: '1', username: 'testuser' });
    
    expect(screen.queryByText('Log in')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign up')).not.toBeInTheDocument();
    
    const profileIcon = screen.getByTitle('View Profile');
    expect(profileIcon).toBeInTheDocument();
  });
  
  test('shows admin dashboard title when admin user is logged in', () => {
    renderNavBar({ id: '1', username: 'adminuser', isAdmin: true });
    
    const profileIcon = screen.getByTitle('Admin Dashboard');
    expect(profileIcon).toBeInTheDocument();
  });
  
  test('clicking review button opens modal when logged in', () => {
    renderNavBar({ id: '1', username: 'testuser' });
    
    const reviewButton = screen.getByText('Review').closest('button');
    fireEvent.click(reviewButton);
    
    expect(screen.getByTestId('review-modal')).toBeInTheDocument();
  });
  
  test('clicking review button redirects to login when not logged in', () => {
    renderNavBar();
    
    const reviewButton = screen.getByText('Review').closest('button');
    fireEvent.click(reviewButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/login', {
      state: {
        from: '/test-path',
        reviewIntent: true
      }
    });
  });
  
  test('clicking close button on review modal closes it', () => {
    renderNavBar({ id: '1', username: 'testuser' });
    
    const reviewButton = screen.getByText('Review').closest('button');
    fireEvent.click(reviewButton);
    
    expect(screen.getByTestId('review-modal')).toBeInTheDocument();
    
    const closeButton = screen.getByText('Close Modal');
    fireEvent.click(closeButton);
    
    expect(screen.queryByTestId('review-modal')).not.toBeInTheDocument();
  });
  
  test('navigation links have correct hrefs', () => {
    renderNavBar();
    
    const bakeryRankingsLink = screen.getByText('Bakery Rankings').closest('a');
    const productCategoriesLink = screen.getByText('Product Rankings').closest('a');
    
    expect(bakeryRankingsLink).toHaveAttribute('href', '/bakery-rankings');
    expect(productCategoriesLink).toHaveAttribute('href', '/product-categories');
  });
});