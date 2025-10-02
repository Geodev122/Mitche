// FIX: The custom `react.d.ts` file was causing a project-wide type resolution error.
// It is now configured to be a valid module that re-exports all of React's types,
// including the default export, to fix module resolution issues.
// FIX: Changed from `export { default } from 'react'` to an explicit import and export
// to resolve a "Circular definition of import alias 'default'" error.

// FIX: To resolve the "Circular definition of import alias 'React'" error,
// the default import is aliased to 'ReactDefault' to prevent a name collision
// with the 'React' namespace that is re-exported via 'export * from 'react''.
import ReactDefault from 'react';
export * from 'react';
export { ReactDefault as default };
