import {
  getWebGLContext,
  WebGL2RenderingContextWithProgram,
  initShaders,
} from './cuon-utils';
import { err, ifErr, black, KEY_CODE } from './common';
import { Matrix4 } from './cuon-matrix';

const VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute vec4 a_Color;
uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjMatrix;
varying vec4 v_Color;
void main(){
  gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
  v_Color = a_Color;
}
`;
const FSHADER_SOUCE = `
precision mediump float;
varying vec4 v_Color;
void main(){
  gl_FragColor = v_Color;
}
`;
const pre = document.querySelector('p#eye');

function main(): void {
  const canvas: HTMLCanvasElement = document.querySelector('canvas#lookat');
  const gl = getWebGLContext(canvas);
  if (!gl) {
    err('fail to init gl');
    return;
  }
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOUCE)) {
    err('fail to init shader');
    return;
  }

  const n = initVertexBuffer(gl);
  if (n < 0) {
    err('fail to init vertex buffer');
    return;
  }

  gl.clearColor(...black);

  const u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (ifErr(u_ViewMatrix, 'fail to get u_ViewMatrix')) return;

  const u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  if (ifErr(u_ProjMatrix, 'fail to get u_ProjMatrix')) return;

  const u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (ifErr(u_ModelMatrix, 'fail to get u_ModelMatrix')) return;
  
  
  // document.onkeydown = (e) => keyDown(e, gl, viewMatrix, u_ViewMatrix, n);

  gl.clear(gl.COLOR_BUFFER_BIT);

  const projMatrix = new Matrix4();
  const viewMatrix = new Matrix4();
  const modelMatrix = new Matrix4();
  // projMatrix.setOrtho(-1, 1, -1, 1, 0,1);
  // gl.uniformMatrix4fv(u_ProjMatrix, false,projMatrix.elements);
  modelMatrix.setTranslate(.75, 0, 0);
  viewMatrix.setLookAt(0,0, 5,0,0, -100,0, 1,0 );
  projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);

  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  draw(gl, viewMatrix, u_ViewMatrix, n);

  modelMatrix.setTranslate(-.75, 0, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  draw(gl, viewMatrix,u_ViewMatrix, n);
}

function initVertexBuffer(gl: WebGL2RenderingContextWithProgram): number {
  const n = 9;
  const verticesColor = new Float32Array([
     // Three triangles on the right side
     0,  1.0,  -4.0,  0.4,  1.0,  0.4, // The back green one
     -0.5, -1.0,  -4.0,  0.4,  1.0,  0.4,
     .5, -1.0,  -4.0,  1.0,  0.4,  0.4, 
 
     0,  1.0,  -2.0,  1.0,  1.0,  0.4, // The middle yellow one
     -0.5, -1.0,  -2.0,  1.0,  1.0,  0.4,
     .5, -1.0,  -2.0,  1.0,  0.4,  0.4, 
 
     0,  1.0,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
     -0.5, -1.0,   0.0,  0.4,  0.4,  1.0,
     .5, -1.0,   0.0,  1.0,  0.4,  0.4, 
 
     // Three triangles on the left side
    // -0.75,  1.0,  -4.0,  0.4,  1.0,  0.4, // The back green one
    // -1.25, -1.0,  -4.0,  0.4,  1.0,  0.4,
    // -0.25, -1.0,  -4.0,  1.0,  0.4,  0.4, 
 
    // -0.75,  1.0,  -2.0,  1.0,  1.0,  0.4, // The middle yellow one
    // -1.25, -1.0,  -2.0,  1.0,  1.0,  0.4,
    // -0.25, -1.0,  -2.0,  1.0,  0.4,  0.4, 
 
    // -0.75,  1.0,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
    // -1.25, -1.0,   0.0,  0.4,  0.4,  1.0,
    // -0.25, -1.0,   0.0,  1.0,  0.4,  0.4, 
  ]);

  const vertexColorBuffer = gl.createBuffer();
  if (ifErr(vertexColorBuffer, 'fail to init buffer')) return;

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColor, gl.STATIC_DRAW);

  const FSIZE = verticesColor.BYTES_PER_ELEMENT;
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    err('fail to get a_Position');
    return;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);

  const a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Color < 0) {
    err('fail to get a_Color');
    return;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  return n;
}

let g_eyeX = 0.2,
  g_eyeY = 0.25,
  g_eyeZ = 0.25;
function keyDown(
  e: KeyboardEvent,
  gl: WebGL2RenderingContextWithProgram,
  viewMatrix: Matrix4,
  u_ViewMatrix,
  n: number
) {
  switch (e.keyCode) {
    case KEY_CODE.left:
      g_eyeX -= 0.01;
      break;
    case KEY_CODE.right:
      g_eyeX += 0.01;
      break;
    default:
      break;
  }
  draw(gl, viewMatrix, u_ViewMatrix, n);
}

function draw(
  gl: WebGL2RenderingContextWithProgram,
  viewMatrix: Matrix4,
  u_ViewMatrix,
  n: number
) {
  // viewMatrix.setLookAt(g_eyeX, g_eyeY, g_eyeZ, 0.0, 0.0, 0.0, 0, 1, 0);
  // gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

  // gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  // pre.innerHTML = `
  //   eyex: ${g_eyeX};
  //   eyey: ${g_eyeY};
  //   eyez: ${g_eyeZ}
  // `;
}

main();
