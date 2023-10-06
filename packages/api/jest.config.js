const {pathsToModuleNameMapper} = require('ts-jest');
const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  // setupFiles: ['<rootDir>/src/utils/jest.ts'],
  moduleNameMapper: pathsToModuleNameMapper({
    '@shared/*': [path.resolve(__dirname, '../shared/src/*')],
    'src/*': [path.resolve(__dirname, 'src/*')],
  }),
};
