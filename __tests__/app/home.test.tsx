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
      screen.getByText(/crypto-actifs sont très volatils/i)
    ).toBeInTheDocument();
  });

  it('links multiple CTAs to /acheter', () => {
    render(<Home />);
    const ctas = screen.getAllByRole('link').filter((link) =>
      link.getAttribute('href')?.startsWith('/acheter')
    );
    expect(ctas.length).toBeGreaterThanOrEqual(2);
  });

  it('renders the legal footer', () => {
    render(<Home />);
    expect(screen.getByText(/Statut Réglementaire/i)).toBeInTheDocument();
  });
});
