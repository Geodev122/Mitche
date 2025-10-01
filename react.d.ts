// FIX: The custom `react.d.ts` file was causing a circular dependency,
// which prevented TypeScript from correctly resolving React's types.
// It has been modified to declare the React namespace without importing it,
// which avoids the circular reference while allowing TypeScript to merge it with the actual React types.
declare namespace React {}
export = React;
