import {
  WebGL2RenderingContextWithProgram,
  getWebGLContext,
  initShaders,
} from './cuon-utils';
import { black, err, KEY_CODE } from './common';
import { Matrix4 } from './cuon-matrix';

const VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute vec4 a_Color;
uniform mat4 u_ProjMatrix;
varying vec4 v_Color;
void main(){
  gl_Position = u_ProjMatrix * a_Position;
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
  const nf: HTMLPreElement = document.querySelector('p#nearFar');
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
  const u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  if (u_ProjMatrix < 0) {
    err('fail to get u_ProjMatrix');
    return;
  }

  const projMatrix = new Matrix4();
  document.onkeydown = (e) => keyDown(e, gl, n, u_ProjMatrix, projMatrix, nf);
  draw(gl, n, u_ProjMatrix, projMatrix, nf);
}

function initVertexBuffer(gl: WebGL2RenderingContextWithProgram) {
  const n = 9;
  const verticesColors = new Float32Array([
      // Vertex coordinates and color
      0.0,  0.6,  -0.4,  0.4,  1.0,  0.4, // The back green one
      -0.5, -0.4,  -0.4,  0.4,  1.0,  0.4,
      0.5, -0.4,  -0.4,  1.0,  0.4,  0.4, 
    
      0.5,  0.4,  -0.2,  1.0,  0.4,  0.4, // The middle yellow one
    -0.5,  0.4,  -0.2,  1.0,  1.0,  0.4,
      0.0, -0.6,  -0.2,  1.0,  1.0,  0.4, 

      0.0,  0.5,   0.0,  0.4,  0.4,  1.0, // The front blue one 
    -0.5, -0.5,   0.0,  0.4,  0.4,  1.0,
      0.5, -0.5,   0.0,  1.0,  0.4,  0.4,     
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

let g_near = 0.0,
  g_far = 0.5;

function keyDown(
  e: KeyboardEvent,
  gl: WebGL2RenderingContextWithProgram,
  n: number,
  u_ProjMatrix,
  projMatrix: Matrix4,
  nf: HTMLPreElement
): void {
  switch (e.keyCode) {
    case KEY_CODE.right:
      g_near += 0.01;
      break;
    case KEY_CODE.left:
      g_near -= 0.01;
      break;
    case KEY_CODE.up:
      g_far += 0.01;
      break;
    case KEY_CODE.down:
      g_far -= 0.01;
      break;
    default:
      return;
  }
  draw(gl, n, u_ProjMatrix, projMatrix, nf);
}

function draw(
  gl: WebGL2RenderingContextWithProgram,
  n: number,
  u_ProjMatrix,
  projMatrix: Matrix4,
  nf: HTMLPreElement
): void {
  projMatrix.setOrtho(-1, 1, -1, 1, g_near, g_far);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
  gl.clear(gl.COLOR_BUFFER_BIT);
  nf.innerHTML = `
    near: ${Math.round(g_near * 100) / 100},
    far: ${Math.round(g_far * 100) / 100}
  `;
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

main();
