import React from 'react';
import { render, screen } from '@testing-library/react';
import CGUPage from '@/app/cgu/page';
import ConfidentialitePage from '@/app/confidentialite/page';
import MentionsLegalesPage from '@/app/mentions-legales/page';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/hooks/useAuth');

describe('Static legal pages', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ ready: true, authenticated: false, login: jest.fn() });
  });

  it('CGU page renders its heading and the legal footer', () => {
    render(<CGUPage />);
    expect(
      screen.getByRole('heading', { name: "Conditions Générales d'Utilisation" })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'CGU' })).toBeInTheDocument();
  });

  it('Confidentialité page renders its heading and the legal footer', () => {
    render(<ConfidentialitePage />);
    expect(
      screen.getByRole('heading', { name: 'Politique de Confidentialité' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Confidentialité' })).toBeInTheDocument();
  });

  it('Mentions Légales page renders its heading and the legal footer', () => {
    render(<MentionsLegalesPage />);
    expect(screen.getByRole('heading', { name: 'Mentions Légales' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mentions Légales' })).toBeInTheDocument();
  });
});
