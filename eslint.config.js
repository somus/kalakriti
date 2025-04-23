import js from '@eslint/js';
import lodash from 'eslint-plugin-lodash';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{ ignores: ['dist'] },
	{
		extends: [
			js.configs.recommended,
			...tseslint.configs.recommendedTypeChecked,
			...tseslint.configs.stylisticTypeChecked
		],
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
			parserOptions: {
				project: [
					'./tsconfig.node.json',
					'./tsconfig.app.json',
					'./tsconfig.api.json'
				],
				tsconfigRootDir: import.meta.dirname
			}
		},
		settings: { react: { version: '19' } },
		plugins: {
			react,
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
			lodash
		},
		rules: {
			...react.configs.recommended.rules,
			...react.configs['jsx-runtime'].rules,
			...reactHooks.configs.recommended.rules,
			'react-hooks/react-compiler': 'error',
			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true }
			],
			'lodash/import-scope': [2, 'method']
		}
	}
);
