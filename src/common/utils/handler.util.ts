import type { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { container } from 'tsyringe'
import { HttpException } from '../exceptions/http.exception.js'
import { EnvService } from '../services/env.service.js'

const envService = container.resolve(EnvService)

export function wrapHandler<T>(
	handler: (event: APIGatewayProxyEventV2) => Promise<T | [number, T]>,
): APIGatewayProxyHandlerV2<never> {
	return async (event) => {
		try {
			const result = await handler(event)
			return createResponse(result, 200)
		}
		catch (err) {
			const error = err as Error
			return createResponse(
				{
					message: error.message,
					stack: envService.isOffline() ? error.stack?.split('\n') : undefined,
				},
				error instanceof HttpException ? error.code : 500,
			)
		}
	}
}

export function createResponse<T>(result: T | [number, T], code: number): APIGatewayProxyStructuredResultV2 {
	if (Array.isArray(result))
		[code, result] = result
	return {
		statusCode: code,
		body: JSON.stringify(result),
		headers: { 'Content-Type': 'application/json' },
	}
}
