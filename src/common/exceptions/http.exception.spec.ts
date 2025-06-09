import { describe, expect, it } from '@jest/globals'
import { HttpException } from './http.exception.js'

describe('HttpException', () => {
	it('should inherit from Error', () => {
		const error = new HttpException(400, '')
		expect(error).toBeInstanceOf(Error)
	})

	describe('parameters', () => {
		it('should accept a status code', () => {
			const error = new HttpException(400, '')
			expect(error.code).toBe(400)
		})

		it('should accept a message', () => {
			const error = new HttpException(0, 'Bad Request')
			expect(error.message).toBe('Bad Request')
		})
	})
})
