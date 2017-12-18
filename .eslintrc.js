
module.exports = {
    root: true,
    parser: 'babel-eslint',
    parserOptions: {
      sourceType: 'module'
    },
    // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
    extends: 'standard',
    // required to lint *.vue files
    plugins: [
      'html'
    ],
    // add your custom rules here
    'rules': {
      "eqeqeq": "off",
      "comma-spacing": "warn",
      "camelcase":"off",
      "indent": "warn",
      "no-unused-vars": "warn",
      "curly":"warn",
      "quotes": "off",
      "no-trailing-spaces": "warn",
      "comma-dangle": "warn",
      "padded-blocks":"warn",
      "space-before-function-paren": "off",
      "space-before-blocks": "warn",
      "spaced-comment": "warn",
      "no-multiple-empty-lines": "warn",
      "semi": "warn",
      "no-undef": "warn",
      "key-spacing": "warn",
      "handle-callback-err": "warn",
      "no-multi-spaces": "warn",
      "indent": "warn",
      "no-redeclare": "warn",
      "space-infix-ops": "warn",
      "keyword-spacing": "warn",
      "no-path-concat": "warn",
      "one-var": "warn",
      "eol-last": "warn",
      // allow paren-less arrow functions
      'arrow-parens': 0,
      // allow async-await
      'generator-star-spacing': 0,
      // allow debugger during development
      'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
    }
  }
