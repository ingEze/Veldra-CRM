/** @type {import("prettier").Config} */
const config = {
  semi: false,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'es5',
  overrides: [
    {
      files: "*.css",
      options: {
        tabWidth: 2,
      },
    },
  ],
}

export default config