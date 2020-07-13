import {
  getWebGLContext,
  initShaders,
  WebGL2RenderingContextWithProgram,
} from './cuon-utils';
import { black } from './common';

const VSHADER_SOURCE: string = `
attribute vec4 a_Position;
uniform vec4 u_Translation;
void main(){
  gl_Position = a_Position + u_Translation;
}
`;

const FSHADER_SOURCE: string = `
precision mediump float;
uniform vec4 u_FragColor;
void main(){
  gl_FragColor = u_FragColor;
}
`;

const tx = 0.5;
const ty = 0.5;
const tz = 0.0;

function main() {
  const canvas: HTMLCanvasElement = document.getElementById(
    'point'
  ) as HTMLCanvasElement;
  const gl: WebGL2RenderingContextWithProgram = getWebGLContext(canvas);
  if (!gl) {
    console.error('fail to init webgl');
    return;
  }
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.error('fail to init shader');
    return;
  }

  const n = initVertexBuffers(gl);
  if (n < 0) {
    console.error('fail to set posion of vertices');
    return;
  }

  const u_Translation = gl.getUniformLocation(gl.program, 'u_Translation');

  gl.uniform4f(u_Translation, tx, ty, tz, 0.0);

  gl.clearColor(...black);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // gl.drawArrays(gl.TRIANGLES, 0, n);
  // gl.drawArrays(gl.LINES, 0, n);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}

function initVertexBuffers(gl: WebGL2RenderingContextWithProgram) {
  const vertices = new Float32Array([0, 0.5, -0.5, -0.5, 0.5, -0.5]);
  const n = 3;

  const vertexBuffer: WebGLBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.error('fail to create buffer obj');
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const a_Position = gl.getAttribLocation(gl.program, 'a_Position');

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(a_Position);

  return n;
}

main();
