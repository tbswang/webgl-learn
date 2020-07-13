import {
  getWebGLContext,
  initShaders,
  WebGL2RenderingContextWithProgram,
} from './cuon-utils';
import { Matrix4 } from './cuon-matrix';
import { black } from './common';

const VSHADER_SOURCE: string = `
attribute vec4 a_Position;
uniform mat4 u_ModelMatrix;
void main(){
  gl_Position = u_ModelMatrix * a_Position;
}
`;

const FSHADER_SOURCE: string = `
precision mediump float;
uniform vec4 u_FragColor;
void main(){
  gl_FragColor = u_FragColor;
}
`;

const ANGLE_STEP = 45.0; // 每秒的旋转速度
let g_last = Date.now();
let curentAngle = 0.0;

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
  gl.clearColor(...black);

  const u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');

  const modelMatrix = new Matrix4();

  const tick = () => {
    curentAngle = animate(curentAngle);
    draw(gl, n, curentAngle, modelMatrix, u_ModelMatrix);
    requestAnimationFrame(tick);
  };
  tick();
}

function draw(
  gl: WebGL2RenderingContextWithProgram,
  n: number,
  curentAngle: number,
  modelMatrix: Matrix4,
  u_ModelMatrix: WebGLUniformLocation
) {
  modelMatrix.setRotate(curentAngle, 0, 0, 1);

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}
function animate(angle: number): number {
  const now = Date.now();
  const elapsed = now - g_last;
  g_last = now;
  const newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle % 360.0;
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
