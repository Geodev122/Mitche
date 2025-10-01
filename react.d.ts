// FIX: The custom `react.d.ts` file was causing a project-wide type resolution error.
// It is now configured to be a valid module that re-exports all of React's types,
// including the default export, to fix module resolution issues.
export * from 'react';
export { default } from 'react';
