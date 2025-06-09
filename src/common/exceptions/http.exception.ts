export class HttpException extends Error {
	constructor(public code: number, message: string) {
		super(message)
		this.name = 'HttpException'
	}
}
