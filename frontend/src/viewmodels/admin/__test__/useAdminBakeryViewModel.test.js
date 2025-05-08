import { renderHook, act } from '@testing-library/react-hooks';
import { useAdminBakeryViewModel } from '../admin/useAdminBakeryViewModel';
import apiClient from '../../services/api';
import { useNotification } from '../../store/NotificationContext';

// Mock dependencies
jest.mock('../../services/api');
jest.mock('../../store/NotificationContext');

describe('useAdminBakeryViewModel', () => {
  const mockShowSuccess = jest.fn();
  const mockShowError = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    useNotification.mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: mockShowError
    });
    
    // Mock successful API response for bakeries
    apiClient.get.mockResolvedValue({
      bakeries: [
        { id: '1', name: 'Test Bakery', zipCode: '1234', streetName: 'Test St', streetNumber: '10' },
        { id: '2', name: 'Another Bakery', zipCode: '5678', streetName: 'Baker Rd', streetNumber: '20' }
      ]
    });
  });
  
  test('fetchBakeries populates bakeries state', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAdminBakeryViewModel());
    
    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();
    
    expect(apiClient.get).toHaveBeenCalledWith('/bakeries', true);
    expect(result.current.bakeries).toHaveLength(2);
    expect(result.current.bakeries[0].name).toBe('Test Bakery');
    expect(result.current.isLoading).toBe(false);
  });
  
  test('handleOpenEditModal sets current bakery and opens modal', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAdminBakeryViewModel());
    await waitForNextUpdate();
    
    const testBakery = result.current.bakeries[0];
    
    act(() => {
      result.current.handleOpenEditModal(testBakery);
    });
    
    expect(result.current.currentBakery).toBe(testBakery);
    expect(result.current.isModalOpen).toBe(true);
  });
  
  test('handleCloseModal resets current bakery and closes modal', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAdminBakeryViewModel());
    await waitForNextUpdate();
    
    // First open the modal
    act(() => {
      result.current.handleOpenEditModal(result.current.bakeries[0]);
    });
    
    // Then close it
    act(() => {
      result.current.handleCloseModal();
    });
    
    expect(result.current.currentBakery).toBe(null);
    expect(result.current.isModalOpen).toBe(false);
  });
  
  test('handleSaveBakery calls correct API for update', async () => {
    apiClient.patch.mockResolvedValue({ success: true });
    
    const { result, waitForNextUpdate } = renderHook(() => useAdminBakeryViewModel());
    await waitForNextUpdate();
    
    // Set up edit mode
    const testBakery = result.current.bakeries[0];
    act(() => {
      result.current.handleOpenEditModal(testBakery);
    });
    
    // Update data
    const updatedData = {
      name: 'Updated Bakery',
      zipCode: '1234',
      streetName: 'Test St',
      streetNumber: '10'
    };
    
    await act(async () => {
      await result.current.handleSaveBakery(updatedData);
    });
    
    expect(apiClient.patch).toHaveBeenCalledWith(
      `/bakeries/update/${testBakery.id}`,
      updatedData,
      false
    );
    expect(mockShowSuccess).toHaveBeenCalledWith('Bakery updated successfully!');
    expect(result.current.isModalOpen).toBe(false);
  });
  
  test('handleSaveBakery calls correct API for create', async () => {
    apiClient.post.mockResolvedValue({ success: true });
    
    const { result, waitForNextUpdate } = renderHook(() => useAdminBakeryViewModel());
    await waitForNextUpdate();
    
    // Set up create mode
    act(() => {
      result.current.handleOpenCreateModal();
    });
    
    // Create data
    const newBakeryData = {
      name: 'New Bakery',
      zipCode: '9999',
      streetName: 'New St',
      streetNumber: '5'
    };
    
    await act(async () => {
      await result.current.handleSaveBakery(newBakeryData);
    });
    
    expect(apiClient.post).toHaveBeenCalledWith(
      '/bakeries/create',
      newBakeryData,
      false
    );
    expect(mockShowSuccess).toHaveBeenCalledWith('Bakery created successfully!');
  });
  
  test('handleDeleteBakery deletes bakery after confirmation', async () => {
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);
    
    apiClient.delete.mockResolvedValue({ success: true });
    
    const { result, waitForNextUpdate } = renderHook(() => useAdminBakeryViewModel());
    await waitForNextUpdate();
    
    const bakeryIdToDelete = '1';
    
    await act(async () => {
      await result.current.handleDeleteBakery(bakeryIdToDelete);
    });
    
    expect(window.confirm).toHaveBeenCalled();
    expect(apiClient.delete).toHaveBeenCalledWith(`/bakeries/delete/${bakeryIdToDelete}`, false);
    expect(mockShowSuccess).toHaveBeenCalledWith('Bakery deleted successfully!');
    
    // Restore original confirm
    window.confirm = originalConfirm;
  });
  
  test('search term filters bakeries correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAdminBakeryViewModel());
    await waitForNextUpdate();
    
    // Initially all bakeries are shown
    expect(result.current.filteredBakeries).toHaveLength(2);
    
    // Set search term
    act(() => {
      result.current.setSearchTerm('Another');
    });
    
    // Only matching bakeries should be shown
    expect(result.current.filteredBakeries).toHaveLength(1);
    expect(result.current.filteredBakeries[0].name).toBe('Another Bakery');
  });
});