import 'reflect-metadata'
import { container } from 'tsyringe'
import { AlmacenadosController } from '../almacenados/controllers/almacenados.controller.js'
import { wrapHandler } from '../common/utils/handler.util.js'

export const create = wrapHandler(async (event) => {
	const controller = container.resolve(AlmacenadosController)
	return controller.createAlmacenado(event)
})
