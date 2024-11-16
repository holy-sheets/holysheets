/* eslint-env node */
module.exports = {
  env: { browser: true, node: true, jest: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:@typescript-eslint/strict',
    'plugin:prettier/recommended'
  ],
  ignorePatterns: [
    '*.js',
    '*.test.ts',
    '*.spec.ts',
    '*.d.ts',
    'dist/',
    'node_modules/'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  ],
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'no-console': 'error',
    // Desabilitamos regras de formatação que conflitam com o Prettier
    // 'indent': ['error', 2, { SwitchCase: 1 }],
    'indent': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'all',
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true
      }
    ],
    // Regras do Prettier
    'prettier/prettier': 'error',
    // Outras regras...
    // Desabilitamos as seguintes regras de formatação para evitar conflitos
    'semi': 'off',
    'comma-dangle': 'off',
    'quotes': 'off',
    'no-multiple-empty-lines': 'off',
    'eqeqeq': 'off',
    'strict': 'error',
    '@typescript-eslint/no-misused-promises': [
      'error',
      { checksVoidReturn: false }
    ],
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/array-type': 'off',
    '@typescript-eslint/method-signature-style': ['error', 'property'],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off'
  },
  root: true
}