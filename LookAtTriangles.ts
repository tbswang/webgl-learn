import {
  WebGL2RenderingContextWithProgram,
  getWebGLContext,
  initShaders,
} from './cuon-utils';
import { black, err , KEY_CODE} from './common';
import { Matrix4 } from './cuon-matrix';

const VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute vec4 a_Color;
uniform mat4 u_ViewMatrix;
varying vec4 v_Color;
void main(){
  gl_Position = u_ViewMatrix * a_Position;
  v_Color = a_Color;
}
`;

const FSHADER_SOURCE = `
precision mediump float;
varying vec4 v_Color;
void main(){
  gl_FragColor = v_Color;
}
`;

function main(): void {
  const canvas: HTMLCanvasElement = document.querySelector('canvas#point');
  const gl: WebGL2RenderingContextWithProgram = getWebGLContext(canvas);
  if (!gl) {
    console.error('fail to get webgl');
    return;
  }

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.error('fail to init shader');
    return;
  }

  gl.clearColor(...black);

  const n = initVertexBuffer(gl);
  if (n < 0) {
    console.error('fail to init vertex buffer');
    return;
  }
  const u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (u_ViewMatrix < 0) {
    err('fail to get u_ViewMatrix');
    return;
  }

  const viewMatrix = new Matrix4();
  // viewMatrix.setLookAt(0, 0, 0, 0, 1, -1, 0, 1, 0);
  // gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  // gl.clear(gl.COLOR_BUFFER_BIT);
  // gl.drawArrays(gl.TRIANGLES, 0, n);
  document.onkeydown = (e) => keyDown(e, gl, n, u_ViewMatrix, viewMatrix);
  draw(gl, n, u_ViewMatrix, viewMatrix);
}

function initVertexBuffer(gl: WebGL2RenderingContextWithProgram) {
  const n = 9;
  const verticesColors = new Float32Array([
    // Vertex coordinates and color(RGBA)
    0.0,
    0.5,
    -0.4,
    0.4,
    1.0,
    0.4, // The back green one
    -0.5,
    -0.5,
    -0.4,
    0.4,
    1.0,
    0.4,
    0.5,
    -0.5,
    -0.4,
    1.0,
    0.4,
    0.4,

    0.5,
    0.4,
    -0.2,
    1.0,
    0.4,
    0.4, // The middle yellow one
    -0.5,
    0.4,
    -0.2,
    1.0,
    1.0,
    0.4,
    0.0,
    -0.6,
    -0.2,
    1.0,
    1.0,
    0.4,

    0.0,
    0.5,
    0.0,
    0.4,
    0.4,
    1.0, // The front blue one
    -0.5,
    -0.5,
    0.0,
    0.4,
    0.4,
    1.0,
    0.5,
    -0.5,
    0.0,
    1.0,
    0.4,
    0.4,
  ]);

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
  const a_Position: number = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.error('fail to get location of a_Position');
    return;
  }
  const FSIZE: number = verticesColors.BYTES_PER_ELEMENT;
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);

  const a_Color: number = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Color < 0) {
    console.error('fail to get a_color');
    return;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return n;
}

let g_eyeX = 0.2,
  g_eyeY = 0.25,
  g_eyeZ = 0.25;

function keyDown(
  e: KeyboardEvent,
  gl: WebGL2RenderingContextWithProgram,
  n: number,
  u_ViewMatrix,
  viewMatrix: Matrix4
): void {
  switch (e.keyCode) {
    case KEY_CODE.right:
      g_eyeX += .01;
      break;
    case KEY_CODE.left:
      g_eyeX -= .01;
      break;
    default:
      return;
  }
  draw(gl, n, u_ViewMatrix, viewMatrix);
}

function draw(gl: WebGL2RenderingContextWithProgram, n: number, u_ViewMatrix, viewMatrix: Matrix4): void{
  viewMatrix.setLookAt(g_eyeX, g_eyeY, g_eyeZ, 0, 0, 0, 0, 1, 0);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

main();
