// FIX: This empty declaration file was overriding React's types, causing "not a module" errors.
// By importing 'react', this file becomes a module augmentation, resolving the issue.
// If you are not augmenting React's types, this file can be safely deleted.
import 'react';
