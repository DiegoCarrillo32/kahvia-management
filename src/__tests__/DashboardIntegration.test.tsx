import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import Dashboard from '../pages/Dashboard';
import * as useOrdersHook from '../hooks/useOrders';
import { createTestQueryClient, createWrapper } from '../test/query-wrapper';
import { QueryClient } from '@tanstack/react-query';
import { Order } from '../types/order';
import '@testing-library/jest-dom';

vi.mock('../hooks/useOrders', () => ({
  useOrders: vi.fn(),
  useMarkOrderAsRoasted: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useMarkOrderAsDelivered: vi.fn(() => ({ mutateAsync: vi.fn() })),
}));

vi.mock('../hooks/useRoasts', () => ({
  useRoastsByOrder: vi.fn(() => ({ data: [] })),
}));

const AllProviders = ({ children, queryClient }: { children: React.ReactNode, queryClient: QueryClient }) => {
  const Wrapper = createWrapper(queryClient);
  return (
    <ChakraProvider>
      <BrowserRouter>
        <Wrapper>
          {children}
        </Wrapper>
      </BrowserRouter>
    </ChakraProvider>
  );
};

describe('Dashboard Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  it('renders loading state initially', () => {
    vi.mocked(useOrdersHook.useOrders).mockReturnValue({
      data: [],
      isLoading: true,
    } as unknown as ReturnType<typeof useOrdersHook.useOrders>);

    render(<Dashboard />, {
      wrapper: (props) => <AllProviders {...props} queryClient={queryClient} />,
    });

    expect(screen.getByText(/Cargando órdenes/i)).toBeInTheDocument();
  });

  it('renders orders when data is loaded', () => {
    const mockOrders = [
      {
        id: '1',
        clientName: 'Test Client',
        status: 'Pendiente',
        coffeeStyle: 'Medio',
        amount: '250g',
        orderPrice: 5000,
        createdAt: new Date(),
        paid: false,
        deliveryAddress: 'Test Address',
      },
    ];

    vi.mocked(useOrdersHook.useOrders).mockReturnValue({
      data: mockOrders as Order[],
      isLoading: false,
    } as unknown as ReturnType<typeof useOrdersHook.useOrders>);

    render(<Dashboard />, {
      wrapper: (props) => <AllProviders {...props} queryClient={queryClient} />,
    });

    expect(screen.getByText('Test Client')).toBeInTheDocument();
    expect(screen.getByText(/Medio - 250g/i)).toBeInTheDocument();
  });
});
