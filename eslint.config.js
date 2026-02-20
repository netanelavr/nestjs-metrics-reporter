const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const globals = require('globals');

module.exports = tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		languageOptions: {
			globals: {
				...globals.node,
				...globals.es2021
			},
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module'
			}
		},
		rules: {
			'indent': ['error', 'tab'],
			'quotes': ['error', 'single'],
			'semi': ['error', 'always'],
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
			'object-curly-spacing': ['error', 'always'],
			'brace-style': ['error', '1tbs'],
			'space-before-function-paren': [
				'error',
				{
					'anonymous': 'always',
					'named': 'never',
					'asyncArrow': 'always'
				}
			],
			'space-in-parens': ['error', 'always'],
			'keyword-spacing': [
				'error',
				{
					'before': true,
					'after': true
				}
			]
		}
	},
	{
		ignores: ['dist/', 'dist/*']
	}
);
