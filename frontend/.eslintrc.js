module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-hooks',
  ],
  rules: {
    // React specific rules
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/prop-types': 'warn',
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'error',
    
    // JavaScript best practices
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    
    // Enforce JavaScript-only development
    'no-restricted-syntax': [
      'error',
      {
        selector: 'TSTypeAnnotation',
        message: 'TypeScript type annotations are not allowed. Use JavaScript only.',
      },
      {
        selector: 'TSInterfaceDeclaration',
        message: 'TypeScript interfaces are not allowed. Use JavaScript objects or JSDoc comments.',
      },
      {
        selector: 'TSTypeAliasDeclaration',
        message: 'TypeScript type aliases are not allowed. Use JavaScript only.',
      },
      {
        selector: 'TSEnumDeclaration',
        message: 'TypeScript enums are not allowed. Use JavaScript objects or constants.',
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.test.jsx'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
