// @ts-check

/** @type {import('jest').Config} **/
export default {
	preset: 'ts-jest/presets/default-esm',
	testMatch: ['<rootDir>/src/**/*.spec.ts'],
	moduleNameMapper: { '(.+)\\.js': '$1' },
}
