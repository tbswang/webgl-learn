declare type vec4 = [number, number, number, number];

declare module '*.jpg';
declare module '*.gif';

declare module '*.vert' {
  const content: string;
  // @ts-ignore
  export default content;
}

declare module '*.frag' {
  const content: string;
  // @ts-ignore
  export default content;
}
