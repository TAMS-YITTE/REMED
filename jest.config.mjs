import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    // @scure/@noble sont livrés en ESM : sans transformation, l'import de
    // la construction de transaction Bitcoin échoue au parsing.
    // Séparateur explicite : sous Windows les chemins utilisent «\», que
    // «/node_modules/» ne reconnaît pas.
    'node_modules[/\\\\](?!(jose|@privy-io|@scure|@noble)[/\\\\])'
  ],
}

export default createJestConfig(config)
