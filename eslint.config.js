// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  // reemplaza .eslintignore
  {
    ignores: ['node_modules', 'dist', 'build', 'coverage', 'public', '*.log'],
  },

  // Reglas base JS (flat)
  js.configs.recommended,

  // Reglas TS (flat, sin type-check para ir rápido)
  ...tseslint.configs.recommended,

  // Ajustes del proyecto
  {
    files: ['**/*.{ts,tsx,js}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // agrega lo que necesites
    },
  },
];
