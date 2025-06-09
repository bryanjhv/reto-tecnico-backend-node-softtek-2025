import { inject, injectable } from 'tsyringe'
import { now } from '../utils/now.util.js'
import { DynamoService } from './dynamo.service.js'
import { EnvService } from './env.service.js'

interface CacheItem {
	key: string
	value: string
	createdAt: number
	expiresAt: number
}

@injectable()
export class CacheService {
	private tableName: string

	constructor(
		@inject(EnvService) private envService: EnvService,
		@inject(DynamoService) private dynamoService: DynamoService,
	) {
		this.tableName = envService.getOrThrow('CACHEADOS_TABLE_NAME')
	}

	async get<T>(key: string): Promise<T | undefined> {
		const { Items } = await this.dynamoService.rawQuery({
			TableName: this.tableName,
			KeyConditionExpression: '#pk = :pk',
			FilterExpression: '#ea > :ea',
			ExpressionAttributeNames: { '#pk': 'key', '#ea': 'expiresAt' },
			ExpressionAttributeValues: { ':pk': key, ':ea': now() },
		})
		if (Items?.length)
			return JSON.parse((Items[0]! as CacheItem).value) as T
		return undefined
	}

	async set<T>(key: string, value: T, ttl = 1800): Promise<void> {
		if (this.envService.isOffline())
			await this.dynamoService.delete(this.tableName, { key })
		await this.dynamoService.put<CacheItem>(this.tableName, {
			key,
			value: JSON.stringify(value),
			createdAt: now(),
			expiresAt: now() + ttl,
		})
	}

	async fetch<T>(key: string, url: string, ttl = 1800): Promise<T | undefined> {
		const cached = await this.get<T>(key)
		if (cached)
			return cached
		const res = await fetch(url)
		if (!res.ok)
			return
		const value = await res.json() as T
		await this.set(key, value, ttl)
		return value
	}
}
