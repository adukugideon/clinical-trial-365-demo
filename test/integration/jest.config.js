module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./test/setupTests.js'],
  moduleNameMapper: {
    '^@helpers/(.*)$': '<rootDir>/src/helpers/$1',
    '^@commands/(.*)$': '<rootDir>/src/commands/$1'
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/',
    '/src/taskpane/taskpane.html'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 90,
      statements: 90
    }
  }
};