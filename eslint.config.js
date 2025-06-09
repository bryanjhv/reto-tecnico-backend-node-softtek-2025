// @ts-check

import antfu from '@antfu/eslint-config'

export default antfu({
	type: 'lib',
	formatters: true,
	stylistic: {
		indent: 'tab',
	},
	typescript: {
		tsconfigPath: 'tsconfig.json',
		overridesTypeAware: {
			'ts/strict-boolean-expressions': 'off',
			'perfectionist/sort-imports': ['error', {
				groups: [
					'type',
					['parent-type', 'sibling-type', 'index-type', 'internal-type'],
					'builtin',
					'side-effect',
					'external',
					'internal',
					['parent', 'sibling', 'index'],
					'object',
					'unknown',
				],
				newlinesBetween: 'ignore',
				order: 'asc',
				type: 'natural',
			}],

		},
	},
})
