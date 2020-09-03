import { WebGLRenderingContextWithProgram } from './cuon-utils';

export const black: vec4 = [0.0, 0.0, 0.0, 1.0];

export const COLOR = {
  red: [1.0, 0.0, 0.0, 1.0],
  green: [0.0, 1.0, 0.0, 1.0],
  white: [1.0, 1.0, 1.0, 1.0],
};

export function getRandomArbitrary(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function err(...params: string[]) {
  console.error(params);
}

export enum KEY_CODE {
  right = 39,
  left = 37,
  up = 38,
  down = 40,
}

export function ifErr(target: any, msg: string): Boolean {
  if (!target) {
    err(msg);
    return true;
  }
  return false;
}

export function initArrayBuffers(
  gl: WebGLRenderingContextWithProgram,
  attribute: string,
  data: Float32Array,
  type: number,
  num: number,
) {
  const buffer = gl.createBuffer();
  if (!buffer) {
    err('fail to init buffer');
    return false;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  const a_attribute: GLint = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    err('fail to get attribue', attribute);
    return false;
  }

  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);
  return true;
}
