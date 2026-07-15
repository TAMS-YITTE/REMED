import React from 'react';
import { renderHook } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { AuthContext } from '@/app/providers';

describe('useAuth hook', () => {
  it('throws an error if used outside of AuthContext', () => {
    // Suppress console.error for the expected thrown error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within Providers');
    
    consoleErrorSpy.mockRestore();
  });

  it('returns context values when wrapped in AuthContext', () => {
    const mockContextValue = {
      ready: true,
      authenticated: true,
      user: { id: 'test_user' },
      walletAddress: '0x123',
      login: jest.fn(),
      logout: jest.fn(),
      isReady: true,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockContextValue}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.authenticated).toBe(true);
    expect(result.current.walletAddress).toBe('0x123');
    expect(result.current.user?.id).toBe('test_user');
  });
});
