const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const config = {
  displayName: '@yellow-book/web',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/web',
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    'node_modules/(?!(next-auth|@auth)/)',
  ],
  moduleNameMapper: {
    '^next-auth/react$': '<rootDir>/__mocks__/next-auth-react.ts',
  },
};

module.exports = createJestConfig(config);
