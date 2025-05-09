import { renderHook, act } from '@testing-library/react-hooks';
import { jest } from '@jest/globals';

let useAdminBakeryViewModel;
let mockBakeryServiceInstance;
let mockShowSuccess, mockShowError; // For NotificationContext

beforeEach(async () => {
  jest.resetModules();

  mockShowSuccess = jest.fn();
  mockShowError = jest.fn();

  mockBakeryServiceInstance = {
    getBakeries: jest.fn(),
    createBakery: jest.fn(),
    updateBakery: jest.fn(),
    deleteBakery: jest.fn(),
    // Add any other bakeryService methods used by the ViewModel
  };

  // Mock api directly if the ViewModel uses it (otherwise this can be removed)
  // await jest.unstable_mockModule('../../../services/api', () => ({
  //   default: { /* ... mock http methods ... */ }
  // }));
  
  await jest.unstable_mockModule('../../../services/bakeryService', () => ({
    default: mockBakeryServiceInstance,
  }));

  await jest.unstable_mockModule('../../../store/NotificationContext', () => ({
    useNotification: () => ({
      showSuccess: mockShowSuccess,
      showError: mockShowError,
    }),
  }));

  const viewModelModule = await import('../useAdminBakeryViewModel');
  useAdminBakeryViewModel = viewModelModule.useAdminBakeryViewModel;
});

describe('useAdminBakeryViewModel', () => {
  test('initial state is correct', () => {
    mockBakeryServiceInstance.getBakeries.mockResolvedValue({ bakeries: [] });
    const { result } = renderHook(() => useAdminBakeryViewModel());
    expect(result.current.bakeries).toEqual([]);
    expect(result.current.isLoading).toBe(true); // Initially true until fetch completes
    expect(result.current.error).toBeNull();
    // Add other initial state checks as necessary
  });

  test('fetches bakeries on mount', async () => {
    const mockBakeries = [{ id: '1', name: 'Test Bakery' }];
    mockBakeryServiceInstance.getBakeries.mockResolvedValue({ bakeries: mockBakeries });

    const { result, waitForNextUpdate } = renderHook(() => useAdminBakeryViewModel());

    await act(async () => {
      await waitForNextUpdate(); // Wait for useEffect to run
    });

    expect(mockBakeryServiceInstance.getBakeries).toHaveBeenCalledTimes(1);
    expect(result.current.bakeries).toEqual(mockBakeries);
    expect(result.current.isLoading).toBe(false);
  });

  test('handles error when fetching bakeries', async () => {
    const errorMessage = 'Failed to fetch';
    mockBakeryServiceInstance.getBakeries.mockRejectedValue(new Error(errorMessage));
    
    const { result, waitForNextUpdate } = renderHook(() => useAdminBakeryViewModel());

    await act(async () => {
      await waitForNextUpdate();
    });
    
    expect(result.current.bakeries).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
    expect(mockShowError).toHaveBeenCalledWith(`Error fetching bakeries: ${errorMessage}`);
  });

  test('handleCreateBakery successfully creates a bakery and refreshes', async () => {
    const newBakeryData = { name: 'New Awesome Bakery' };
    const createdBakery = { id: '2', ...newBakeryData };
    mockBakeryServiceInstance.createBakery.mockResolvedValue(createdBakery);
    mockBakeryServiceInstance.getBakeries.mockResolvedValue({ bakeries: [createdBakery] }); // After refresh

    const { result, waitForNextUpdate } = renderHook(() => useAdminBakeryViewModel());
    
    // Initial fetch
    mockBakeryServiceInstance.getBakeries.mockResolvedValueOnce({ bakeries: [] }); 
    await act(async () => { await waitForNextUpdate(); });


    await act(async () => {
      await result.current.handleSaveBakery(null, newBakeryData); // null for id means create
    });
    
    expect(mockBakeryServiceInstance.createBakery).toHaveBeenCalledWith(newBakeryData);
    expect(mockShowSuccess).toHaveBeenCalledWith('Bakery created successfully!');
    expect(mockBakeryServiceInstance.getBakeries).toHaveBeenCalledTimes(2); // Initial + refresh
    expect(result.current.isModalOpen).toBe(false);
  });
  
  test('handleUpdateBakery successfully updates a bakery and refreshes', async () => {
    const existingBakery = { id: '1', name: 'Old Bakery Name' };
    const updatedData = { name: 'Updated Bakery Name' };
    const updatedBakery = { ...existingBakery, ...updatedData };

    mockBakeryServiceInstance.updateBakery.mockResolvedValue(updatedBakery);
    // For initial fetch
    mockBakeryServiceInstance.getBakeries.mockResolvedValueOnce({ bakeries: [existingBakery] }); 
    // For fetch after update
    mockBakeryServiceInstance.getBakeries.mockResolvedValueOnce({ bakeries: [updatedBakery] });


    const { result, waitForNextUpdate } = renderHook(() => useAdminBakeryViewModel());
    await act(async () => { await waitForNextUpdate(); }); // Initial fetch

    await act(async () => {
      result.current.handleOpenEditModal(existingBakery); // Open modal to set currentBakery
    });
    
    await act(async () => {
      await result.current.handleSaveBakery(existingBakery.id, updatedData);
    });
    
    expect(mockBakeryServiceInstance.updateBakery).toHaveBeenCalledWith(existingBakery.id, updatedData);
    expect(mockShowSuccess).toHaveBeenCalledWith('Bakery updated successfully!');
    expect(mockBakeryServiceInstance.getBakeries).toHaveBeenCalledTimes(2); // Initial + refresh
    expect(result.current.isModalOpen).toBe(false);
  });

  test('handleDeleteBakery successfully deletes a bakery and refreshes', async () => {
    const bakeryToDelete = { id: '1', name: 'Bakery To Delete' };
    mockBakeryServiceInstance.deleteBakery.mockResolvedValue({});
    // For initial fetch
    mockBakeryServiceInstance.getBakeries.mockResolvedValueOnce({ bakeries: [bakeryToDelete] });
    // For fetch after delete
    mockBakeryServiceInstance.getBakeries.mockResolvedValueOnce({ bakeries: [] });


    const { result, waitForNextUpdate } = renderHook(() => useAdminBakeryViewModel());
    await act(async () => { await waitForNextUpdate(); }); // Initial fetch

    await act(async () => {
      await result.current.handleDeleteBakery(bakeryToDelete.id);
    });

    expect(mockBakeryServiceInstance.deleteBakery).toHaveBeenCalledWith(bakeryToDelete.id);
    expect(mockShowSuccess).toHaveBeenCalledWith('Bakery deleted successfully');
    expect(mockBakeryServiceInstance.getBakeries).toHaveBeenCalledTimes(2); // Initial + refresh
  });

  // Add more tests for modal states, error handling in CUD operations, search/filter etc.
});