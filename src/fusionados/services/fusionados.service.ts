import { Buffer } from 'node:buffer'
import { inject, injectable } from 'tsyringe'
import { DynamoService } from '../../common/services/dynamo.service.js'
import { EnvService } from '../../common/services/env.service.js'
import { Fusionado } from '../interfaces/fusionado.interface.js'
import { SwapiService } from './swapi.service.js'
import { TmdbService } from './tmdb.service.js'

interface FusionadoItem {
	pk: number
	sk: number
	it: Fusionado
}

type FusionadoKey = Omit<FusionadoItem, 'it'>

export interface HistorialResponse {
	count: number
	offset?: string
	items: Fusionado[]
}

const pk = 0 // for query

@injectable()
export class FusionadosService {
	private tableName: string

	constructor(
		@inject(EnvService) envService: EnvService,
		@inject(DynamoService) private dynamoService: DynamoService,
		@inject(SwapiService) private swapiService: SwapiService,
		@inject(TmdbService) private tmdbService: TmdbService,
	) {
		this.tableName = envService.getOrThrow('FUSIONADOS_TABLE_NAME')
	}

	async findFusionado(id: number): Promise<Fusionado | undefined> {
		const person = await this.swapiService.getPerson(id)
		if (!person)
			return

		const filmUrl = person.films[Math.floor(Math.random() * person.films.length)]!
		const filmId = +filmUrl.split('/').slice(-2, -1)[0]!
		const film = await this.swapiService.getFilm(filmId)
		if (!film)
			return

		const movie = await this.tmdbService.getMovie(film.title, film.release_date.split('-')[0]!)
		if (!movie)
			return

		const fusionado: Fusionado = {
			id,
			nombre: person.name,
			altura: person.height === 'none' ? 0 : person.height === 'unknown' ? -1 : Number.parseFloat(person.height),
			masa: person.mass === 'unknown' ? -1 : Number.parseFloat(person.mass.replace(',', '')),
			genero: {
				'male': 'masculino',
				'female': 'femenino',
				'hermaphrodite': 'hermafrodita',
				'none': 'androide',
				'n/a': 'androide',
			}[person.gender]!,
			pelicula: {
				titulo: film.title,
				director: film.director,
				lanzamiento: movie.release_date,
				poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
			},
		}

		await this.dynamoService.put<FusionadoItem>(this.tableName, {
			pk, // for query
			sk: Date.now(), // for sort, use high precision timestamp
			it: fusionado,
		})
		return fusionado
	}

	async getHistorial(limit = 10, offset?: string): Promise<HistorialResponse> {
		let exclusiveStartKey: Record<string, any> | undefined
		if (offset)
			exclusiveStartKey = this.decodeOffset(offset)

		const { Items, LastEvaluatedKey } = await this.dynamoService.rawQuery({
			TableName: this.tableName,
			KeyConditionExpression: 'pk = :pk',
			ExpressionAttributeValues: { ':pk': pk },
			ProjectionExpression: 'it',
			Limit: limit,
			ExclusiveStartKey: exclusiveStartKey,
		})

		return {
			count: Items?.length ?? 0,
			offset: LastEvaluatedKey ? this.encodeKey(LastEvaluatedKey as FusionadoKey) : undefined,
			items: Items ? (Items as FusionadoItem[]).map(item => item.it) : [],
		} as HistorialResponse
	}

	private encodeKey(key: FusionadoKey): string {
		return Buffer.from(`${key.sk}`).toString('base64url')
	}

	private decodeOffset(offset: string): FusionadoKey {
		return { pk, sk: +Buffer.from(offset, 'base64url').toString() }
	}
}
