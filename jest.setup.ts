import '@testing-library/jest-dom'
import React from 'react';

// jsdom has no IntersectionObserver; framer-motion's viewport/whileInView
// features (used on the homepage) need at least a no-op stub to mount.
class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
(global as any).IntersectionObserver = IntersectionObserverMock;

jest.mock('@/app/providers', () => ({
  AuthContext: React.createContext(null),
  Providers: ({ children }: any) => React.createElement('div', null, children),
}));
