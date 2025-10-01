// The original content of this file was causing circular dependencies and breaking ES module imports.
// This file has been corrected to prevent those issues. A proper setup would likely remove this file
// entirely to rely on @types packages from node_modules.

declare module 'react' {
    export = React;
    export as namespace React;
}

declare module 'react-dom/client' {
    export = ReactDOMClient;
    export as namespace ReactDOMClient;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}
