module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue-i18n/recommended',
    'plugin:vue/recommended',
    '@vue/airbnb',
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/array-bracket-spacing': 'error',
    'vue/arrow-spacing': 'error',
    'vue/block-spacing': 'error',
    'vue/brace-style': 'error',
    'vue/camelcase': ['error', { properties: 'never' }],
    'vue/comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'always-multiline',
    }],
    'vue/component-name-in-template-casing': ['error', 'PascalCase', {
      registeredComponentsOnly: false,
      ignores: ['i18n'],
    }],
    'vue/eqeqeq': 'error',
    'vue/key-spacing': 'error',
    'vue/match-component-file-name': 'error',
    'vue/no-boolean-default': 'error',
    'vue/no-restricted-syntax': 'error',
    'vue/object-curly-spacing': ['error', 'always'],
    'vue/require-direct-export': 'error',
    'vue/space-infix-ops': 'error',
    'vue/space-unary-ops': 'error',
    'vue/v-on-function-call': 'error',
    'vue-i18n/no-dynamic-keys': 'error',
    'vue-i18n/no-unused-keys': 'error',
    'vue-i18n/no-raw-text': 'error',
    'vue-i18n/no-missing-keys': process.env.NODE_ENV === 'production' ? 'off' : 'warn',
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)',
      ],
      env: {
        jest: true,
      },
    },
  ],
  settings: {
    'vue-i18n': {
      localeDir: './src/locales/*.json',
    },
  },
};
