import type { APIGatewayRequestSimpleAuthorizerHandlerV2 } from 'aws-lambda'
import 'reflect-metadata'
import { container } from 'tsyringe'
import { AutorizadosController } from '../autorizados/controllers/autorizados.controller.js'
import { wrapHandler } from '../common/utils/handler.util.js'

export const register = wrapHandler(async (event) => {
	const controller = container.resolve(AutorizadosController)
	return controller.registerUsuario(event)
})

export const login = wrapHandler(async (event) => {
	const controller = container.resolve(AutorizadosController)
	return controller.loginUsuario(event)
})

export const check: APIGatewayRequestSimpleAuthorizerHandlerV2 = async (event) => {
	const controller = container.resolve(AutorizadosController)
	return { isAuthorized: await controller.checkAuthorization(event) }
}
