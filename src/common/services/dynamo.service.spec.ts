import 'reflect-metadata'
import { DeleteCommand, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { container } from 'tsyringe'
import { DynamoService } from './dynamo.service.js'

interface TestItem {
	id: string
	name: string
}

describe('DynamoService', () => {
	let service: DynamoService

	const items: Record<string, TestItem> = {
		1: { id: '1', name: 'test' },
	}
	// @ts-expect-error private property
	const sendMock = jest.fn<typeof service.docClient.send>((command) => {
		if (command instanceof GetCommand) {
			return { Item: items[command.input.Key!['id'] as string] }
		}
		else if (command instanceof PutCommand) {
			items[command.input.Item!['id'] as string] = command.input.Item as TestItem
		}
		else if (command instanceof DeleteCommand) {
			delete items[command.input.Key!['id'] as string]
		}
		else if (command instanceof QueryCommand) {
			return { Items: Object.values(items).filter(item => item.id === command.input.ExpressionAttributeValues![':id']) }
		}
		else {
			throw new TypeError(`Unsupported command`)
		}
	})

	beforeEach(() => {
		service = container.resolve(DynamoService)
		// @ts-expect-error private property
		jest.spyOn(service.docClient, 'send').mockImplementation(sendMock)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})

	describe('get', () => {
		it('should return item if found', async () => {
			const item = { id: '1', name: 'test' }
			const result = await service.get('table', { id: '1' })
			expect(result).toEqual(item)
			expect(sendMock).toHaveBeenCalledWith(expect.any(GetCommand))
		})

		it('should return undefined if item not found', async () => {
			const result = await service.get('table', { id: '2' })
			expect(result).toBeUndefined()
			expect(sendMock).toHaveBeenCalledWith(expect.any(GetCommand))
		})
	})

	describe('put', () => {
		it('should put an item', async () => {
			const item = { id: '2', name: 'test' }
			const result = await service.put('table', item)
			expect(result).toBeUndefined()
			expect(sendMock).toHaveBeenCalledWith(expect.any(PutCommand))
		})

		it('should have put the item', async () => {
			const item = { id: '2', name: 'test' }
			const result = await service.get('table', { id: '2' })
			expect(result).toEqual(item)
			expect(sendMock).toHaveBeenCalledWith(expect.any(GetCommand))
		})
	})

	describe('delete', () => {
		it('should delete an item', async () => {
			await service.delete('table', { id: '2' })
			expect(sendMock).toHaveBeenCalledWith(expect.any(DeleteCommand))
		})

		it('should not find the deleted item', async () => {
			const result = await service.get('table', { id: '2' })
			expect(result).toBeUndefined()
			expect(sendMock).toHaveBeenCalledWith(expect.any(GetCommand))
		})
	})

	describe('rawQuery', () => {
		it('should execute a raw query', async () => {
			const queryInput = { TableName: 'table', KeyConditionExpression: 'id = :id', ExpressionAttributeValues: { ':id': '1' } }
			const queryOutput = { Items: [{ id: '1', name: 'test' }] }
			const result = await service.rawQuery(queryInput)
			expect(result).toEqual(queryOutput)
			expect(sendMock).toHaveBeenCalledWith(expect.any(QueryCommand))
		})
	})
})
