import { inject, injectable } from 'tsyringe'
import { CacheService } from '../../common/services/cache.service.js'
import { EnvService } from '../../common/services/env.service.js'
import { Movie } from '../interfaces/movie.interface.js'

@injectable()
export class TmdbService {
	private baseUrl: string
	private apiKey: string

	constructor(
		@inject(EnvService) envService: EnvService,
		@inject(CacheService) private cacheService: CacheService,
	) {
		this.baseUrl = envService.getOrThrow('TMDB_API_URL')
		this.apiKey = envService.getOrThrow('TMDB_API_KEY')
	}

	async getMovie(title: string, year: string): Promise<Movie | undefined> {
		// this use case does not require handling pagination
		const data = await this.cacheService.fetch<{ results: Movie[] }>(
			`tmdb:search:${title.replaceAll(' ', '-')}:${year}`,
			`${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(title)}&year=${year}`,
		)
		return data?.results[0]
	}
}
