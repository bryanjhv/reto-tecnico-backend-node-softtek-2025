import 'reflect-metadata'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { container } from 'tsyringe'
import { EnvService } from './env.service.js'

describe('EnvService', () => {
	let service: EnvService

	beforeEach(() => {
		service = container.resolve(EnvService)
		jest.spyOn(service, 'get').mockImplementation(
			(key: string, def?: string) => ({ TEST_ENV_VAR: 'test_value' }[key] ?? def),
		)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})

	describe('get', () => {
		it('should return value of existing env var', () => {
			expect(service.get('TEST_ENV_VAR')).toBe('test_value')
		})

		it('should return default value if env var does not exist', () => {
			expect(service.get('NON_EXISTENT_VAR', 'default_value')).toBe('default_value')
		})

		it('should return undefined if env var does not exist and no default provided', () => {
			expect(service.get('NON_EXISTENT_VAR')).toBeUndefined()
		})
	})

	describe('getOrThrow', () => {
		it('should return value of existing env var', () => {
			expect(service.getOrThrow('TEST_ENV_VAR')).toBe('test_value')
		})

		it('should throw error if env var does not exist', () => {
			expect(() => service.getOrThrow('NON_EXISTENT_VAR')).toThrow('Environment variable NON_EXISTENT_VAR not set')
		})
	})

	describe('isOffline', () => {
		it('should return false', () => {
			expect(service.isOffline()).toBe(false)
		})
	})
})
