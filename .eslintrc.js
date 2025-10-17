module.exports = {
   root: true,
   extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
   ],
   parser: '@typescript-eslint/parser',
   parserOptions: {
      ecmaFeatures: {
         jsx: true,
      },
      ecmaVersion: 2020,
      sourceType: 'module',
   },
   plugins: ['@typescript-eslint', 'react', 'react-hooks'],
   rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
   },
   settings: {
      react: {
         version: 'detect',
      },
   },
   env: {
      browser: true,
      es2020: true,
      node: true,
   },
};
