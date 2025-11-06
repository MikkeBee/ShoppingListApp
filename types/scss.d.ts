// Type declarations for SCSS modules
declare module '*.module.scss' {
  const content: { [className: string]: string };
  export default content;
}

// Allow side-effect SCSS imports (for global styles)
declare module '*.scss' {
  const content: Record<string, never>;
  export = content;
}
