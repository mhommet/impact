module.exports = {
  // Format et lint les fichiers TypeScript et JavaScript
  '**/*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],
  // Format les fichiers CSS, SCSS, JSON, etc.
  '**/*.{css,scss,json,md}': ['prettier --write'],
};
