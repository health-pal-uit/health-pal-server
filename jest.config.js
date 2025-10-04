// jest.config.js
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  moduleFileExtensions: ['ts', 'js', 'json'],
  // Map alias "src/*" -> "<rootDir>/src/*"
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
    prefix: '<rootDir>/',
  }),
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json', // hoặc tsconfig.json nếu bạn không dùng tsconfig.spec.json
      isolatedModules: true,
    },
  },
  testPathIgnorePatterns: [
    '<rootDir>/test/', // thư mục test mặc định của Nest
    '<rootDir>/.*/__tests__/', // nếu có
    '<rootDir>/src/.*\\.spec\\.[tj]sx?$', // *.spec.ts/tsx/js/jsx
    '<rootDir>/src/.*\\.test\\.[tj]sx?$', // *.test.ts/tsx/js/jsx
    '<rootDir>/src/.*\\.e2e-spec\\.[tj]sx?$', // *.e2e-spec.ts/tsx/...
  ],
};
