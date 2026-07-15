import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/hooks/useAuth');

describe('Home page (/)', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ ready: true, authenticated: false, login: jest.fn() });
  });

  it('shows the risk disclaimer above the fold', () => {
    render(<Home />);
    expect(
      screen.getByText(/investissements à risque élevé/i)
    ).toBeInTheDocument();
  });

  it('links the main and bottom CTAs to /acheter', () => {
    render(<Home />);
    const ctas = screen.getAllByRole('link', { name: /acheter maintenant/i });
    expect(ctas.length).toBeGreaterThanOrEqual(2);
    ctas.forEach((cta) => expect(cta).toHaveAttribute('href', '/acheter'));
  });

  it('renders the legal footer', () => {
    render(<Home />);
    expect(screen.getByText(/Statut Réglementaire/i)).toBeInTheDocument();
  });
});
