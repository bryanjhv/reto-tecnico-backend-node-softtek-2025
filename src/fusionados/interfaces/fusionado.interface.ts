export interface Fusionado {
	id: number
	nombre: string
	altura: number
	masa: number
	genero: string
	pelicula: {
		titulo: string
		director: string
		lanzamiento: string
		poster: string
	}
}
