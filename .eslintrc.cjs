/* eslint-env node */
module.exports = {
    env: { browser: true, node: true, jest: true },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
      'plugin:@typescript-eslint/strict'
    ],
    ignorePatterns: ['*.js'],
    parserOptions: {
      parser: '@typescript-eslint/parser',
      project: './tsconfig.json',
      tsconfigRootDir: __dirname
    },
    rules: {
      'no-console': 'error',  // the logger should handle every log statement. 
      // this rule can be removed after we enforce ts-standard
      "@typescript-eslint/no-unused-vars": [
        "error", {
          "args": "all",
          "argsIgnorePattern": "^_",
          "caughtErrors": "all",
          "caughtErrorsIgnorePattern": "^_",
          "destructuredArrayIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "ignoreRestSiblings": true
        }
      ],
      // rules to be replaced by ts-standard:
  
      semi: [2, 'never'],
      'comma-dangle': [2, 'never'],
      strict: 'error',
      eqeqeq: 'off',
      'no-multiple-empty-lines': ['error', { max: 1 }],
      quotes: [2, 'single', { 'avoidEscape': true }],
      indent: ['error', 2, { 'SwitchCase': 1 }],
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: false }
      ],
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/array-type': 'off',
      // TODO [Inter]: bellow are rules turned off due to the impossibility of autofix them
      //   as soon as we have the time, verify one by one of them, removing the exception
      '@typescript-eslint/method-signature-style': ['error', 'property'],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    root: true
  }
  