import type { APIGatewayProxyEventV2 } from 'aws-lambda'
import type { HistorialResponse } from '../services/fusionados.service.js'
import { inject, injectable } from 'tsyringe'
import { HttpException } from '../../common/exceptions/http.exception.js'
import { Fusionado } from '../interfaces/fusionado.interface.js'
import { FusionadosService } from '../services/fusionados.service.js'

@injectable()
export class FusionadosController {
	constructor(
		@inject(FusionadosService) private fusionadosService: FusionadosService,
	) {}

	async findFusionado(event: APIGatewayProxyEventV2): Promise<Fusionado> {
		const id = event.queryStringParameters?.['id']
		if (!id)
			throw new HttpException(400, 'missing id parameter')
		if (Number.isNaN(Number(id)))
			throw new HttpException(400, 'invalid id parameter')
		const fusionado = await this.fusionadosService.findFusionado(+id)
		if (!fusionado)
			throw new HttpException(404, 'fusionado not found')
		return fusionado
	}

	async getHistorial(event: APIGatewayProxyEventV2): Promise<HistorialResponse> {
		const limit = event.queryStringParameters?.['limit']
		if (limit && Number.isNaN(Number(limit)))
			throw new HttpException(400, 'non numeric limit')
		if (limit && +limit < 1)
			throw new HttpException(400, 'invalid limit number')
		const offset = event.queryStringParameters?.['offset'] // TODO: how to validate?
		return this.fusionadosService.getHistorial(+(limit ?? 10), offset)
	}
}
