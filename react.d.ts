// FIX: The previous content of this file created a circular dependency by using `import`.
// This prevented TypeScript from resolving any React types correctly.
// Using `export ... from` syntax is the correct way to re-export modules
// and should resolve the type resolution issue across the entire application.
export { default } from 'react';
export * from 'react';