export const black: vec4 = [0.0, 0.0, 0.0, 1.0];

export const COLOR = {
  red: [1.0, 0.0, 0.0, 1.0],
  green: [0.0, 1.0, 0.0, 1.0],
  white: [1.0, 1.0, 1.0, 1.0],
};

export function getRandomArbitrary(min: number, max: number) : number{
  return Math.random() * (max - min) + min;
}