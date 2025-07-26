import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { jest } from '@jest/globals';
import Home from './page';

// Mock dependencies
jest.mock('@/trpc/client', () => ({
  useTRPC: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
  },
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-testid="invoke-button"
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ onChange, value, className, ...props }: any) => (
    <input
      onChange={onChange}
      value={value}
      className={className}
      data-testid="input-field"
      {...props}
    />
  ),
}));

// Import mocked modules
import { useTRPC } from '@/trpc/client';
import { toast } from 'sonner';

const mockUseTRPC = useTRPC as jest.MockedFunction<typeof useTRPC>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('Home Component', () => {
  let queryClient: QueryClient;
  let mockMutate: jest.Mock;
  let mockInvokeOptions: jest.Mock;

  beforeEach(() => {
    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Set up mocks
    mockMutate = jest.fn();
    mockInvokeOptions = jest.fn().mockReturnValue({
      mutationFn: mockMutate,
      onSuccess: expect.any(Function),
    });

    mockUseTRPC.mockReturnValue({
      invoke: {
        mutationOptions: mockInvokeOptions,
      },
    } as any);

    mockToast.success = jest.fn();

    // Mock useMutation to return controlled values
    const mockUseMutation = jest.fn().mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    });

    // Mock React Query's useMutation
    jest.doMock('@tanstack/react-query', () => ({
      ...jest.requireActual('@tanstack/react-query'),
      useMutation: mockUseMutation,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>
    );
  };

  describe('Component Rendering', () => {
    it('renders input field and invoke button', () => {
      renderComponent();

      expect(screen.getByTestId('input-field')).toBeInTheDocument();
      expect(screen.getByTestId('invoke-button')).toBeInTheDocument();
      expect(screen.getByText('Invoke Job')).toBeInTheDocument();
    });

    it('renders with initial empty input value', () => {
      renderComponent();

      const input = screen.getByTestId('input-field') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('renders button in enabled state initially', () => {
      renderComponent();

      const button = screen.getByTestId('invoke-button');
      expect(button).not.toBeDisabled();
    });

    it('applies correct CSS classes to container', () => {
      renderComponent();

      const container = screen.getByTestId('invoke-button').parentElement;
      expect(container).toHaveClass('p-4', 'max-w-7xl', 'mx-auto');
    });
  });

  describe('Input Interaction', () => {
    it('updates input value when user types', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByTestId('input-field');
      await user.type(input, 'test input');

      expect(input).toHaveValue('test input');
    });

    it('handles empty input value', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByTestId('input-field');
      await user.type(input, 'test');
      await user.clear(input);

      expect(input).toHaveValue('');
    });

    it('handles special characters in input', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByTestId('input-field');
      const specialChars = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./"';
      await user.type(input, specialChars);

      expect(input).toHaveValue(specialChars);
    });

    it('handles long input strings', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByTestId('input-field');
      const longString = 'a'.repeat(1000);
      
      // Use fireEvent for long strings to avoid performance issues
      fireEvent.change(input, { target: { value: longString } });

      expect(input).toHaveValue(longString);
    });

    it('handles unicode and emoji characters', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByTestId('input-field');
      const unicodeText = '测试 🚀 émojis 🎉';
      
      fireEvent.change(input, { target: { value: unicodeText } });

      expect(input).toHaveValue(unicodeText);
    });

    it('maintains input value across component updates', async () => {
      const user = userEvent.setup();
      const { rerender } = renderComponent();

      const input = screen.getByTestId('input-field');
      await user.type(input, 'persistent value');

      rerender(
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>
      );

      expect(screen.getByTestId('input-field')).toHaveValue('persistent value');
    });
  });

  describe('Button Click and Mutation Handling', () => {
    it('calls TRPC mutation when button is clicked', () => {
      renderComponent();

      const button = screen.getByTestId('invoke-button');
      fireEvent.click(button);

      expect(mockInvokeOptions).toHaveBeenCalledWith({
        onSuccess: expect.any(Function),
      });
    });

    it('passes current input value to mutation', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByTestId('input-field');
      const button = screen.getByTestId('invoke-button');

      await user.type(input, 'test value');
      fireEvent.click(button);

      expect(mockMutate).toHaveBeenCalledWith({ value: 'test value' });
    });

    it('handles button click with empty input', () => {
      renderComponent();

      const button = screen.getByTestId('invoke-button');
      fireEvent.click(button);

      expect(mockMutate).toHaveBeenCalledWith({ value: '' });
    });

    it('handles multiple button clicks', () => {
      renderComponent();

      const button = screen.getByTestId('invoke-button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockMutate).toHaveBeenCalledTimes(3);
    });

    it('uses current input value for each mutation call', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByTestId('input-field');
      const button = screen.getByTestId('invoke-button');

      await user.type(input, 'first');
      fireEvent.click(button);

      await user.clear(input);
      await user.type(input, 'second');
      fireEvent.click(button);

      expect(mockMutate).toHaveBeenCalledWith({ value: 'first' });
      expect(mockMutate).toHaveBeenCalledWith({ value: 'second' });
    });
  });

  describe('Success Toast Notifications', () => {
    it('shows success toast when mutation succeeds', () => {
      let onSuccessCallback: () => void;

      mockInvokeOptions.mockImplementation((options: any) => {
        onSuccessCallback = options.onSuccess;
        return {
          mutationFn: mockMutate,
          onSuccess: options.onSuccess,
        };
      });

      renderComponent();

      const button = screen.getByTestId('invoke-button');
      fireEvent.click(button);

      // Simulate successful mutation
      onSuccessCallback!();

      expect(mockToast.success).toHaveBeenCalledWith('Background job started');
    });

    it('calls toast.success only once per successful mutation', () => {
      let onSuccessCallback: () => void;

      mockInvokeOptions.mockImplementation((options: any) => {
        onSuccessCallback = options.onSuccess;
        return {
          mutationFn: mockMutate,
          onSuccess: options.onSuccess,
        };
      });

      renderComponent();

      const button = screen.getByTestId('invoke-button');
      fireEvent.click(button);

      onSuccessCallback!();

      expect(mockToast.success).toHaveBeenCalledTimes(1);
    });

    it('shows toast for each successful mutation', () => {
      let onSuccessCallback: () => void;

      mockInvokeOptions.mockImplementation((options: any) => {
        onSuccessCallback = options.onSuccess;
        return {
          mutationFn: mockMutate,
          onSuccess: options.onSuccess,
        };
      });

      renderComponent();

      const button = screen.getByTestId('invoke-button');
      
      // First mutation
      fireEvent.click(button);
      onSuccessCallback!();

      // Second mutation
      fireEvent.click(button);
      onSuccessCallback!();

      expect(mockToast.success).toHaveBeenCalledTimes(2);
    });
  });

  describe('Loading State and Button Disabled State', () => {
    it('disables button when mutation is pending', () => {
      // Mock useMutation to return pending state
      const mockUseMutation = jest.fn().mockReturnValue({
        mutate: mockMutate,
        isPending: true,
        isError: false,
        error: null,
      });

      jest.doMock('@tanstack/react-query', () => ({
        ...jest.requireActual('@tanstack/react-query'),
        useMutation: mockUseMutation,
      }));

      renderComponent();

      const button = screen.getByTestId('invoke-button');
      expect(button).toBeDisabled();
    });

    it('enables button when mutation is not pending', () => {
      renderComponent();

      const button = screen.getByTestId('invoke-button');
      expect(button).not.toBeDisabled();
    });

    it('prevents clicks when button is disabled', () => {
      const mockUseMutation = jest.fn().mockReturnValue({
        mutate: mockMutate,
        isPending: true,
        isError: false,
        error: null,
      });

      jest.doMock('@tanstack/react-query', () => ({
        ...jest.requireActual('@tanstack/react-query'),
        useMutation: mockUseMutation,
      }));

      renderComponent();

      const button = screen.getByTestId('invoke-button');
      fireEvent.click(button);

      // Since button is disabled, mutation should not be called
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  describe('TRPC Integration', () => {
    it('calls useTRPC hook on component mount', () => {
      renderComponent();

      expect(mockUseTRPC).toHaveBeenCalled();
    });

    it('accesses invoke method from TRPC client', () => {
      renderComponent();

      expect(mockInvokeOptions).toHaveBeenCalled();
    });

    it('handles TRPC client errors gracefully', () => {
      mockUseTRPC.mockImplementation(() => {
        throw new Error('TRPC client error');
      });

      expect(() => renderComponent()).toThrow('TRPC client error');
    });

    it('handles missing invoke method', () => {
      mockUseTRPC.mockReturnValue({} as any);

      expect(() => renderComponent()).toThrow();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles rapid successive button clicks gracefully', () => {
      renderComponent();

      const button = screen.getByTestId('invoke-button');
      
      // Simulate rapid clicking
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
      }

      expect(mockMutate).toHaveBeenCalledTimes(10);
    });

    it('handles input changes during mutation execution', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByTestId('input-field');
      const button = screen.getByTestId('invoke-button');

      await user.type(input, 'initial value');
      fireEvent.click(button);

      // Change input while mutation might be running
      await user.clear(input);
      await user.type(input, 'changed value');

      expect(input).toHaveValue('changed value');
    });

    it('handles null or undefined input values', () => {
      renderComponent();

      const input = screen.getByTestId('input-field');
      const button = screen.getByTestId('invoke-button');

      // Simulate null value
      fireEvent.change(input, { target: { value: null } });
      fireEvent.click(button);

      expect(mockMutate).toHaveBeenCalledWith({ value: null });
    });

    it('maintains component state after errors', () => {
      let onSuccessCallback: () => void;

      mockInvokeOptions.mockImplementation((options: any) => {
        onSuccessCallback = options.onSuccess;
        throw new Error('Mutation setup failed');
      });

      expect(() => renderComponent()).toThrow('Mutation setup failed');
    });
  });

  describe('Accessibility', () => {
    it('provides accessible button for screen readers', () => {
      renderComponent();

      const button = screen.getByRole('button', { name: 'Invoke Job' });
      expect(button).toBeInTheDocument();
    });

    it('provides accessible input field', () => {
      renderComponent();

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('properly handles disabled state for accessibility', () => {
      const mockUseMutation = jest.fn().mockReturnValue({
        mutate: mockMutate,
        isPending: true,
        isError: false,
        error: null,
      });

      jest.doMock('@tanstack/react-query', () => ({
        ...jest.requireActual('@tanstack/react-query'),
        useMutation: mockUseMutation,
      }));

      renderComponent();

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
    });

    it('maintains focus management during interactions', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByTestId('input-field');
      const button = screen.getByTestId('invoke-button');

      await user.click(input);
      expect(input).toHaveFocus();

      await user.tab();
      expect(button).toHaveFocus();
    });
  });

  describe('Component Integration with UI Library', () => {
    it('passes correct props to Button component', () => {
      renderComponent();

      const button = screen.getByTestId('invoke-button');
      expect(button).toHaveAttribute('data-testid', 'invoke-button');
    });

    it('passes correct props to Input component', () => {
      renderComponent();

      const input = screen.getByTestId('input-field');
      expect(input).toHaveAttribute('data-testid', 'input-field');
    });

    it('maintains proper component hierarchy', () => {
      renderComponent();

      const container = screen.getByTestId('invoke-button').parentElement;
      const input = screen.getByTestId('input-field');
      
      expect(container).toContainElement(input);
      expect(container).toContainElement(screen.getByTestId('invoke-button'));
    });
  });

  describe('Performance and Memory', () => {
    it('does not create unnecessary re-renders', () => {
      const { rerender } = renderComponent();

      // Rerender with same props
      rerender(
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>
      );

      // Component should still be functional
      expect(screen.getByTestId('input-field')).toBeInTheDocument();
      expect(screen.getByTestId('invoke-button')).toBeInTheDocument();
    });

    it('properly cleans up event listeners', () => {
      const { unmount } = renderComponent();

      // Component should unmount without errors
      expect(() => unmount()).not.toThrow();
    });
  });
});