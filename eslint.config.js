import pluginJs from '@eslint/js';
import globals from 'globals';

export default [
  { languageOptions: { globals: globals.node } },
  {
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-const': 'error',
    },
  },
  pluginJs.configs.recommended,
];
