import '@testing-library/jest-dom'
import React from 'react';

jest.mock('@/app/providers', () => ({
  AuthContext: React.createContext(null),
  Providers: ({ children }: any) => React.createElement('div', null, children),
}));
