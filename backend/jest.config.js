// Unit tests: files named *.spec.ts under src/
export default {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  extensionsToTreatAsEsm: ['.ts'],
  // Maps "./x.js" imports (ESM style) to the real "./x.ts" files.
  resolver: '<rootDir>/jest.resolver.cjs',
  transform: {
    '^.+[.]ts$': ['ts-jest', { useESM: true, tsconfig: 'tsconfig.json' }],
  },
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'coverage',
};
