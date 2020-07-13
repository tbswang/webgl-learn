import {
  getWebGLContext,
  initShaders,
  WebGL2RenderingContextWithProgram,
} from './cuon-utils';
import { black } from './common';

const VSHADER_SOURCE: string = `
attribute vec4 a_Position;
uniform mat4 u_xFormMatrix;
void main(){
  gl_Position = u_xFormMatrix * a_Position;
}
`;

const FSHADER_SOURCE: string = `
precision mediump float;
uniform vec4 u_FragColor;
void main(){
  gl_FragColor = u_FragColor;
}
`;

const ANGLE = 90.0;

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

  const radian = (Math.PI * ANGLE) / 180.0;
  const cosB = Math.cos(radian);
  const sinB = Math.sin(radian);

  const xFormMatrix = new Float32Array([
    cosB, sinB, 0.0, .0,
    -sinB, cosB, .0, .0,
    .0, .0, 1.0, .0,
    .0, .0, .0, 1.0
  ])

  const u_xFormMatrix = gl.getUniformLocation(gl.program, 'u_xFormMatrix');

  gl.uniformMatrix4fv(u_xFormMatrix, false, xFormMatrix);

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
