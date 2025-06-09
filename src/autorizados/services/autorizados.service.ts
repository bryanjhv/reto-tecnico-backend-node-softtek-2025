import { compare, hash } from 'bcryptjs'
import { sign, verify } from 'jsonwebtoken'
import { inject, injectable } from 'tsyringe'
import { DynamoService } from '../../common/services/dynamo.service.js'
import { EnvService } from '../../common/services/env.service.js'
import { Usuario } from '../interfaces/usuario.interface.js'

@injectable()
export class AutorizadosService {
	private tableName: string
	private jwtSecret: string

	constructor(
		@inject(EnvService) envService: EnvService,
        @inject(DynamoService) private dynamoService: DynamoService,
	) {
		this.tableName = envService.getOrThrow('AUTORIZADOS_TABLE_NAME')
		this.jwtSecret = envService.getOrThrow('JWT_SECRET_KEY')
	}

	async findUsuario(username: string): Promise<Usuario | undefined> {
		return this.dynamoService.get<Usuario>(this.tableName, { username })
	}

	async createUsuario(usuario: Usuario): Promise<boolean> {
		const existing = await this.findUsuario(usuario.username)
		if (existing)
			return false
		usuario.password = await hash(usuario.password!, 10)
		await this.dynamoService.put<Usuario>(this.tableName, usuario)
		delete usuario.password
		return true
	}

	async verifyUsuario(username: string, password: string): Promise<boolean> {
		const usuario = await this.findUsuario(username)
		return usuario ? compare(password, usuario.password!) : false
	}

	async createToken(username: string): Promise<string> {
		return sign({}, this.jwtSecret, {
			algorithm: 'HS256',
			subject: username,
			notBefore: 0,
			expiresIn: 3600,
		})
	}

	async verifyToken(token: string): Promise<boolean> {
		try {
			verify(token, this.jwtSecret, {
				algorithms: ['HS256'],
			})
			return true
		}
		// eslint-disable-next-line unused-imports/no-unused-vars
		catch (error) {
			return false
		}
	}
}
