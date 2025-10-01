// FIX: This declaration file was overriding React's type definitions.
// The original `export * from 'react'` created a circular dependency.
// By re-exporting from '@types/react', this file now acts as a proper proxy
// to the correct type definitions, resolving all errors related to missing
// React types like `useState`, `FC`, etc.
// FIX: Corrected to import from 'react' instead of '@types/react' which is not allowed.

// FIX: `export { default } from 'react'` created a circular dependency that broke
// all React type imports. Re-exporting the default and named types explicitly
// resolves the issue for the entire application.
import React from 'react';
export * from 'react';
export default React;
