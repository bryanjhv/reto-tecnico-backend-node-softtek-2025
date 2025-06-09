import type { APIGatewayProxyEventV2, APIGatewayRequestAuthorizerEventV2 } from 'aws-lambda'
import { inject, injectable } from 'tsyringe'
import { HttpException } from '../../common/exceptions/http.exception.js'
import { Usuario } from '../interfaces/usuario.interface.js'
import { AutorizadosService } from '../services/autorizados.service.js'

@injectable()
export class AutorizadosController {
	constructor(
		@inject(AutorizadosService) private autorizadosService: AutorizadosService,
	) {}

	async registerUsuario(event: APIGatewayProxyEventV2): Promise<[number, Usuario]> {
		const usuario = this.getUsuarioFromEvent(event)
		const success = await this.autorizadosService.createUsuario(usuario)
		if (!success)
			throw new HttpException(409, 'username already exists')
		delete usuario.password
		return [201, usuario]
	}

	async loginUsuario(event: APIGatewayProxyEventV2): Promise<{ token: string }> {
		const usuario = this.getUsuarioFromEvent(event)
		const success = await this.autorizadosService.verifyUsuario(usuario.username, usuario.password!)
		if (!success)
			throw new HttpException(401, 'wrong user credentials')
		return { token: await this.autorizadosService.createToken(usuario.username) }
	}

	private getUsuarioFromEvent(event: APIGatewayProxyEventV2): Usuario {
		const body = event.body
		if (!body)
			throw new HttpException(400, 'missing request body')
		let usuario: Usuario | undefined
		try {
			usuario = JSON.parse(body) as Usuario | undefined
			if (typeof usuario !== 'object')
				throw new HttpException(400, 'invalid request body')
		}
		// eslint-disable-next-line unused-imports/no-unused-vars
		catch (error) {
			throw new HttpException(400, 'invalid body format')
		}
		if (!usuario.username || !usuario.password
			|| typeof usuario.username !== 'string' || typeof usuario.password !== 'string'
		) {
			throw new HttpException(400, 'invalid post data')
		}
		return usuario
	}

	async checkAuthorization(event: APIGatewayRequestAuthorizerEventV2): Promise<boolean> {
		const [type, token] = event.identitySource[0]?.split(' ') ?? []
		if (type !== 'Bearer' || !token)
			return false
		// TODO: add username to context?
		return this.autorizadosService.verifyToken(token)
	}
}
