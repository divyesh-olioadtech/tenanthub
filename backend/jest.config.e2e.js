import base from './jest.config.js';

// End-to-end tests: files named *.e2e-spec.ts under test/
export default {
  ...base,
  testMatch: ['<rootDir>/test/**/*.e2e-spec.ts'],
};
