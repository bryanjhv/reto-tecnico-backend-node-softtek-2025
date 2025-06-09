import type { Person } from '../interfaces/person.interface.js'
import { inject, injectable } from 'tsyringe'
import { CacheService } from '../../common/services/cache.service.js'
import { EnvService } from '../../common/services/env.service.js'
import { Film } from '../interfaces/film.interface.js'

@injectable()
export class SwapiService {
	private baseUrl: string

	constructor(
		@inject(EnvService) envService: EnvService,
		@inject(CacheService) private cacheService: CacheService,
	) {
		this.baseUrl = envService.getOrThrow('SW_API_URL')
	}

	async getPerson(id: number): Promise<Person | undefined> {
		return this.cacheService.fetch<Person>(`swapi:people:${id}`, `${this.baseUrl}/people/${id}/`)
	}

	async getFilm(id: number): Promise<Film | undefined> {
		return this.cacheService.fetch<Film>(`swapi:films:${id}`, `${this.baseUrl}/films/${id}/`)
	}
}
