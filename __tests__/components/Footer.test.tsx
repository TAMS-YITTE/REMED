import React from 'react';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/Footer';

describe('Footer', () => {
  it('renders the legal links with the correct destinations', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: 'Mentions Légales' })).toHaveAttribute(
      'href',
      '/mentions-legales'
    );
    expect(screen.getByRole('link', { name: 'CGU' })).toHaveAttribute('href', '/cgu');
    expect(screen.getByRole('link', { name: 'Confidentialité' })).toHaveAttribute(
      'href',
      '/confidentialite'
    );
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute(
      'href',
      'mailto:contact@remedly.fr'
    );
  });

  it('discloses the regulatory status (not PSAN/CASP, non-custodial, regulated partners)', () => {
    render(<Footer />);

    expect(screen.getByText(/Statut Réglementaire/i)).toBeInTheDocument();
    expect(screen.getByText(/PSAN/)).toBeInTheDocument();
    expect(screen.getByText(/CASP/)).toBeInTheDocument();
    expect(screen.getByText(/ne conserve à aucun moment les fonds/)).toBeInTheDocument();
    expect(screen.getByText('Privy')).toBeInTheDocument();
    expect(screen.getByText('MoonPay')).toBeInTheDocument();
  });

  it('shows the current year in the copyright line', () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${year} Remedly`))).toBeInTheDocument();
  });
});
