module.exports = {
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    parserOptions: {
        ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
    },
    ignorePatterns: ['generated'],
    extends: [
        'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        // Uses eslint-config-prettier to disable ESLint rules
        // from @typescript-eslint/eslint-plugin that would conflict with prettier
        'prettier/@typescript-eslint',
        // Enables eslint-plugin-prettier and eslint-config-prettier.
        // This will display prettier errors as ESLint errors.
        // Make sure this is always the last configuration in the extends array.
        'plugin:prettier/recommended',
    ],
    rules: {
        'linebreak-style': 'off',
        semi: 0,
        'no-console': 'off',
        'no-multiple-empty-lines': 'off',
        'max-len': ['warn', { code: 120 }],
        // 'object-curly-newline': ['error', { multiline: true }],
        // indent: ['error', 4],
        'key-spacing': 'off',
        'padded-blocks': 0,
        'no-multi-spaces': 'off',
        'arrow-parens': 'off',
        'no-underscore-dangle': 'off',
        'no-confusing-arrow': 0,
        'no-use-before-define': 'off',
        'switch-colon-spacing': 'off',
        'consistent-return': 'off',
        'keyword-spacing': 'off',
        quotes: [
            'error',
            'single',
            {
                allowTemplateLiterals: true,
                avoidEscape: true,
            },
        ],
        'template-curly-spacing': 'off',
        'no-param-reassign': 'off',
        'implicit-arrow-linebreak': 'off',
        'import/prefer-default-export': 'off',
        'no-unused-expressions': ['error', { allowTernary: true }],
        'prefer-destructuring': 'off',
        'no-return-assign': ['error', 'except-parens'],
        'no-plusplus': 'off',
        'no-fallthrough': 'error',
    },
    env: {
        node: true,
        mocha: true,
    },
};
