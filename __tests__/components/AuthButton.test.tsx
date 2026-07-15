import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthButton } from '@/components/AuthButton';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/hooks/useAuth');

describe('AuthButton', () => {
  const mockLogin = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when not ready', () => {
    (useAuth as jest.Mock).mockReturnValue({
      ready: false,
    });
    const { container } = render(<AuthButton />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders "Créer mon compte" button when ready and not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      ready: true,
      authenticated: false,
      login: mockLogin,
    });

    render(<AuthButton />);
    
    const btn = screen.getByRole('button', { name: /créer mon compte/i });
    expect(btn).toBeInTheDocument();
    
    fireEvent.click(btn);
    expect(mockLogin).toHaveBeenCalledTimes(1);
  });

  it('renders "Déconnexion" and "Mon Portefeuille" link when authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      ready: true,
      authenticated: true,
      logout: mockLogout,
    });

    render(<AuthButton />);
    
    const logoutBtn = screen.getByRole('button', { name: /déconnexion/i });
    expect(logoutBtn).toBeInTheDocument();

    const portfolioLink = screen.getByRole('link', { name: /mon portefeuille/i });
    expect(portfolioLink).toBeInTheDocument();
    expect(portfolioLink).toHaveAttribute('href', '/portefeuille');

    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
