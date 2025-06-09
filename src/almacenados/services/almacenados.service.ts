import { inject, injectable } from 'tsyringe'
import { DynamoService } from '../../common/services/dynamo.service.js'
import { EnvService } from '../../common/services/env.service.js'
import { Almacenado } from '../interfaces/almacenado.interface.js'

@injectable()
export class AlmacenadosService {
	private tableName: string

	constructor(
		@inject(EnvService) envService: EnvService,
        @inject(DynamoService) private dynamoService: DynamoService,
	) {
		this.tableName = envService.getOrThrow('ALMACENADOS_TABLE_NAME')
	}

	async createAlmacenado(almacenado: Almacenado): Promise<boolean> {
		const existing = await this.dynamoService.get<Almacenado>(this.tableName, { id: almacenado.id })
		if (existing)
			return false
		await this.dynamoService.put<Almacenado>(this.tableName, almacenado)
		return true
	}
}
