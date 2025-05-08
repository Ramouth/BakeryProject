import React from 'react';
import { render, act, screen } from '@testing-library/react';
import { useBakeryRankingsViewModel } from '../useBakeryRankingsViewModel';
import apiClient from '../../services/api';

// Mock dependencies
jest.mock('../../services/api');

function TestComponent({ onRender }) {
  const vm = useBakeryRankingsViewModel();
  onRender(vm);
  return null;
}

describe('useBakeryRankingsViewModel', () => {
  let vm;

  beforeEach(() => {
    jest.clearAllMocks();
    vm = undefined;

    // Mock API responses
    apiClient.get.mockImplementation((url) => {
      if (url === '/bakeries') {
        return Promise.resolve({
          bakeries: [
            { id: '1', name: 'Top Bakery', zipCode: '1050' },
            { id: '2', name: 'Mid Bakery', zipCode: '2000' },
            { id: '3', name: 'Low Bakery', zipCode: '3000' }
          ]
        });
      } else if (url.includes('/bakeries/stats')) {
        return Promise.resolve({
          stats: [
            { bakery_id: '1', average_rating: 8.0, review_count: 10, ratings: { overall: 8.0, service: 7.0, price: 6.0 } },
            { bakery_id: '2', average_rating: 6.0, review_count: 5, ratings: { overall: 6.0, service: 5.0, price: 7.0 } },
            { bakery_id: '3', average_rating: 4.0, review_count: 2, ratings: { overall: 4.0, service: 3.0, price: 5.0 } }
          ]
        });
      }
      return Promise.resolve({});
    });
  });

  function renderVM() {
    return act(() => {
      render(<TestComponent onRender={v => { vm = v; }} />);
    });
  }

  test('initializes with sorted bakeries based on rating', async () => {
    await renderVM();
    // Wait for async updates
    await act(async () => { await Promise.resolve(); });

    expect(vm.loading).toBe(false);
    expect(vm.bakeries).toHaveLength(3);
    expect(vm.bakeries[0].name).toBe('Top Bakery');
    expect(vm.bakeries[1].name).toBe('Mid Bakery');
    expect(vm.bakeries[2].name).toBe('Low Bakery');
  });

  test('filters by zip code', async () => {
    await renderVM();
    await act(async () => { await Promise.resolve(); });

    act(() => {
      vm.setSelectedZipCode('1050');
      vm.handleSearch({ zipCode: '1050' });
    });

    expect(vm.bakeries).toHaveLength(1);
    expect(vm.bakeries[0].name).toBe('Top Bakery');
  });

  test('filters by rating', async () => {
    await renderVM();
    await act(async () => { await Promise.resolve(); });

    act(() => {
      vm.setSelectedRating('3');
      vm.handleSearch({ rating: '3' });
    });

    expect(vm.bakeries).toHaveLength(2);
    expect(vm.bakeries[0].name).toBe('Top Bakery');
    expect(vm.bakeries[1].name).toBe('Mid Bakery');
  });

  test('loads more bakeries when requested', async () => {
    await renderVM();
    await act(async () => { await Promise.resolve(); });

    expect(vm.bakeries.length).toBeGreaterThan(0);
    expect(vm.hasMore).toBe(false);

    act(() => {
      vm.loadMore();
    });

    expect(vm.bakeries).toHaveLength(3);
  });

  test('combines filter criteria correctly', async () => {
    await renderVM();
    await act(async () => { await Promise.resolve(); });

    act(() => {
      vm.setSelectedZipCode('1050');
      vm.setSelectedRating('4');
      vm.handleSearch({ zipCode: '1050', rating: '4' });
    });

    expect(vm.bakeries).toHaveLength(1);
    expect(vm.bakeries[0].name).toBe('Top Bakery');

    act(() => {
      vm.setSelectedZipCode('3000');
      vm.setSelectedRating('4');
      vm.handleSearch({ zipCode: '3000', rating: '4' });
    });

    expect(vm.bakeries).toHaveLength(0);
  });
});