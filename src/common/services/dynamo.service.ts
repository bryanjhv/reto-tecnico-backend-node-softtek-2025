import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, QueryCommandInput, QueryCommandOutput } from '@aws-sdk/lib-dynamodb'
import { inject, injectable } from 'tsyringe'
import { EnvService } from './env.service.js'

@injectable()
export class DynamoService {
	private readonly client: DynamoDBClient
	private readonly docClient: DynamoDBDocumentClient

	constructor(
		@inject(EnvService) envService: EnvService,
	) {
		this.client = new DynamoDBClient({
			endpoint: envService.isOffline() ? 'http://localhost:8000' : undefined,
		})
		this.docClient = DynamoDBDocumentClient.from(this.client)
	}

	async get<T extends Record<string, any>>(tableName: string, key: Record<string, any>): Promise<T | undefined> {
		const { Item } = await this.docClient.send(new GetCommand({
			TableName: tableName,
			Key: key,
		}))
		return Item ? (Item as T) : undefined
	}

	async put<T extends Record<string, any>>(tableName: string, item: T): Promise<void> {
		await this.docClient.send(new PutCommand({
			TableName: tableName,
			Item: item,
		}))
	}

	async delete(tableName: string, key: Record<string, any>): Promise<void> {
		await this.docClient.send(new DeleteCommand({
			TableName: tableName,
			Key: key,
		}))
	}

	async rawQuery(input: QueryCommandInput): Promise<QueryCommandOutput> {
		return this.docClient.send(new QueryCommand(input))
	}
}
