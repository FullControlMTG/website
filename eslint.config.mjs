import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

// eslint-config-next is still eslintrc-style, so it has to be bridged into flat config.
const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const config = [
  { ignores: ['.next/**', '.cache/**', 'node_modules/**', 'public/**'] },
  ...compat.extends('next/core-web-vitals'),
  // ESLint 9 only globs .js/.mjs/.cjs by default; this project is mostly .jsx.
  { files: ['**/*.{js,mjs,cjs,jsx}'] },
];

export default config;
