module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.js'],
  parserOptions: { 
    ecmaVersion: 'latest', 
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: { 
    react: { 
      version: '18.2'
    } 
  },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/prop-types': 'off',
    'no-unused-vars': ['warn', { 
      'varsIgnorePattern': '^_',
      'argsIgnorePattern': '^_' 
    }],
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    'react/jsx-filename-extension': [1, { 'extensions': ['.js', '.jsx'] }],
    'react/jsx-props-no-spreading': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'warn',
    'jsx-quotes': ['warn', 'prefer-double'],
    'comma-dangle': ['warn', 'always-multiline'],
    'semi': ['warn', 'always'],
    'arrow-parens': ['warn', 'as-needed'],
    'object-curly-spacing': ['warn', 'always'],
    'array-bracket-spacing': ['warn', 'never'],
    'quote-props': ['warn', 'as-needed'],
    'no-trailing-spaces': 'warn',
    'eol-last': ['warn', 'always'],
    'no-multiple-empty-lines': ['warn', { 'max': 1, 'maxEOF': 1 }],
  },
}