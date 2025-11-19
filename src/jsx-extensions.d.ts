// JSX declarations for React Three Fiber extensions
declare global {
  namespace JSX {
    interface IntrinsicElements {
      text: import('troika-three-text').TextProps;
    }
  }
}