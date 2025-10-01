// FIX: The custom `react.d.ts` file was causing a circular dependency,
// which prevented TypeScript from correctly resolving React's types.
// The previous implementation used an `export ... from` syntax that resulted
// in a "Circular definition" error.
//
// This version uses `export =` syntax, which correctly exports the entire
// React namespace. This resolves the module resolution loop and allows
// TypeScript to correctly interpret React's types, fixing errors across the
// project for both `import * as React from 'react'` and
// `import React, { ... } from 'react'` styles.
import * as React from 'react';
export = React;
