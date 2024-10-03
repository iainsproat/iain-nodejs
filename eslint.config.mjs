import globals from 'globals'
import js from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import tseslint from 'typescript-eslint'

/**
 * TODO:
 * - Check speed (inspect ignored files, that we're not processing junk)
 * - Fix lint-staged
 */

/**
 * Feed in import.meta.url in your .mjs module to get the equivalent of __dirname
 * @param {string} importMetaUrl
 */
export const getESMDirname = (importMetaUrl) => {
  return dirname(fileURLToPath(importMetaUrl))
}

/**
 * Base configs that should be inherited in all packages as well
 * @type {Array<import('eslint').Linter.FlatConfig>}
 */
export const baseConfigs = [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/dist-*/**',
      '**/public/**',
      '**/events.json',
      '**/generated/**/*',
      '**/.nuxt/**',
      '**/.output/**'
    ]
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      sourceType: 'module'
    }
  },
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs'
    }
  },
  {
    files: ['**/*.{js,mjs,cjs}', '**/.*.{js,mjs,cjs}'],
    ...js.configs.recommended
  },
  prettierConfig,
  {
    rules: {
      camelcase: [
        1,
        {
          properties: 'always'
        }
      ],
      'no-var': 'error',
      'no-alert': 'error',
      eqeqeq: 'error',
      'prefer-const': 'warn',
      'object-shorthand': 'warn'
    }
  }
]

const configs = [
  ...baseConfigs,
  {
    ignores: ['dist', 'public', 'docs']
  },
  {
    files: ['**/*.js'],
    ignores: ['**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ['bin/www'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    }
  },
  ...tseslint.configs.recommendedTypeChecked.map((c) => ({
    ...c,
    files: [...(c.files || []), '**/*.ts', '**/*.d.ts']
  })),
  {
    files: ['**/*.ts', '**/*.d.ts'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: getESMDirname(import.meta.url),
        project: './tsconfig.json'
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-return': 'error'
    }
  },
  {
    files: ['**/*.spec.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  prettierConfig
]

export default configs
