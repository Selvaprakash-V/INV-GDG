import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  { ignores: ['.next/**', 'node_modules/**', 'coverage/**', 'out/**', 'build/**', 'next-env.d.ts'] },
  // Without this, ESLint 9 silently skips .jsx files (most of the UI).
  { files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['src/server/core/logger.js', 'scripts/**', 'tests/**'],
    rules: { 'no-console': 'off' },
  },
];

export default eslintConfig;
