import {
  getWebGLContext,
  WebGL2RenderingContextWithProgram,
  initShaders,
} from './cuon-utils';
import { err, ifErr, black } from './common';
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
const FSHADER_SOUCE = `
precision mediump float;
varying vec4 v_Color;
void main(){
  gl_FragColor = v_Color;
}
`;

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

  const viewMatrix = new Matrix4();
  viewMatrix.setLookAt(0.2, 0.25, 0.25, 0.0, 0.0, 0.0, 0, 1, 0);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffer(gl: WebGL2RenderingContextWithProgram): number {
  const n = 9;
  const verticesColor = new Float32Array([
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

main();
