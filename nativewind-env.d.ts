/// <reference types="nativewind/types" />

// NativeWind's CSS entry is imported for its side effect; TypeScript needs to
// be told that a .css import is a module rather than a missing type.
declare module '*.css';
