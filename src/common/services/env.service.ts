import { env } from 'node:process'
import { injectable } from 'tsyringe'

@injectable()
export class EnvService {
	get(key: string, def?: string): string | undefined {
		return env[key] ?? def
	}

	getOrThrow(key: string, def?: string): string {
		const value = this.get(key, def)
		if (value === undefined)
			throw new Error(`Environment variable ${key} not set`)
		return value
	}

	isOffline(): boolean {
		return this.get('IS_OFFLINE') === 'true'
	}
}
