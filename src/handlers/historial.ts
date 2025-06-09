import 'reflect-metadata'
import { container } from 'tsyringe'
import { wrapHandler } from '../common/utils/handler.util.js'
import { FusionadosController } from '../fusionados/controllers/fusionados.controller.js'

export const get = wrapHandler(async (event) => {
	const controller = container.resolve(FusionadosController)
	return controller.getHistorial(event)
})
