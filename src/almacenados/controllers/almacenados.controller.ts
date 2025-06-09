import type { APIGatewayProxyEventV2 } from 'aws-lambda'
import type { Almacenado } from '../interfaces/almacenado.interface.js'
import { inject, injectable } from 'tsyringe'
import { HttpException } from '../../common/exceptions/http.exception.js'
import { AlmacenadosService } from '../services/almacenados.service.js'

@injectable()
export class AlmacenadosController {
	constructor(
		@inject(AlmacenadosService) private almacenadosService: AlmacenadosService,
	) {}

	async createAlmacenado(event: APIGatewayProxyEventV2): Promise<Almacenado> {
		const body = event.body
		if (!body)
			throw new HttpException(400, 'missing request body')
		let almacenado: Almacenado | undefined
		try {
			almacenado = JSON.parse(body) as Almacenado | undefined
			if (typeof almacenado !== 'object')
				throw new HttpException(400, 'invalid request body')
		}
		// eslint-disable-next-line unused-imports/no-unused-vars
		catch (error) {
			throw new HttpException(400, 'invalid body format')
		}
		if (!almacenado.id || !almacenado.firstName || !almacenado.lastName
			|| typeof almacenado.id !== 'string' || typeof almacenado.firstName !== 'string' || typeof almacenado.lastName !== 'string'
			|| almacenado.id.length !== 8 || almacenado.firstName.length < 2 || almacenado.lastName.length < 2
		) {
			throw new HttpException(400, 'invalid post data')
		}
		const success = await this.almacenadosService.createAlmacenado(almacenado)
		if (!success)
			throw new HttpException(409, 'id already exists')
		return almacenado
	}
}
