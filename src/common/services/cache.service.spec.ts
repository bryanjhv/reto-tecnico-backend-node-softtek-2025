import 'reflect-metadata'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { container } from 'tsyringe'
import { now } from '../utils/now.util.js'
import { CacheService } from './cache.service.js'
import { DynamoService } from './dynamo.service.js'
import { EnvService } from './env.service.js'

describe('CacheService', () => {
	let service: CacheService

	const rawQueryMock = jest.fn<DynamoService['rawQuery']>()
	const putMock = jest.fn<DynamoService['put']>()

	beforeEach(() => {
		const envService = container.resolve(EnvService)
		jest.spyOn(envService, 'get').mockReturnValue('table')
		container.registerInstance(EnvService, envService)

		const dynamoService = container.resolve(DynamoService)
		jest.spyOn(dynamoService, 'rawQuery').mockImplementation(rawQueryMock)
		jest.spyOn(dynamoService, 'put').mockImplementation(putMock)
		container.registerInstance(DynamoService, dynamoService)

		service = container.resolve(CacheService)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})

	describe('get', () => {
		it('should return cached value if exists', async () => {
			const key = 'testKey'
			const value = { data: 'testData' }
			rawQueryMock.mockResolvedValueOnce({
				$metadata: {},
				Items: [{ key, value: JSON.stringify(value), createdAt: now(), expiresAt: now() + 1000 }],
			})
			const result = await service.get<typeof value>(key)
			expect(result).toEqual(value)
			expect(rawQueryMock).toHaveBeenCalled()
		})

		it('should return undefined if no cached value', async () => {
			const key = 'testKey'
			rawQueryMock.mockResolvedValueOnce({ $metadata: {}, Items: [] })
			const result = await service.get(key)
			expect(result).toBeUndefined()
			expect(rawQueryMock).toHaveBeenCalled()
		})
	})

	describe('set', () => {
		it('should store value in cache', async () => {
			const key = 'testKey'
			const value = { data: 'testData' }
			await service.set(key, value, 3600)
			expect(putMock).toHaveBeenCalled()
		})
	})
})
