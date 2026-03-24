import { defineConfig } from 'oxfmt';

const sortTailwindcss = {
  stylesheet: './src/styles/index.css',
  attributes: [':class']
};

export default defineConfig({
  semi: true,
  singleQuote: true,
  trailingComma: 'none',
  printWidth: 100,
  tabWidth: 2,
  sortPackageJson: false,
  ignorePatterns: [],
  sortTailwindcss
});
