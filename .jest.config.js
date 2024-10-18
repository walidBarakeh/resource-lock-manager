export const preset = 'ts-jest';
export const testEnvironment = 'node';
export const transform = {
  '^.+\\.tsx?$': 'ts-jest',
};
export const transformIgnorePatterns = ['/node_modules/'];
  