import {
  getWebGLContext,
  initShaders,
  WebGLRenderingContextWithProgram,
} from './cuon-utils';
import { err, black, initArrayBuffers } from './common';
import { Matrix4 } from './cuon-matrix';

const VERTEXSHADER_SOUCE: string = `
#pragma vscode_glsllint_stage: vert

attribute vec4 a_Position;
attribute vec4 a_Normal;
uniform mat4 u_MvpMatrix;
uniform mat4 u_NoramlMatrix;
varying vec4 v_Color;
void main(){
  gl_Position =  u_MvpMatrix * a_Position;
  vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7));
  vec4 color = vec4(1.0, 0.4, 0.0, 1.0);
  vec3 normal = normalize((u_NoramlMatrix * a_Normal).xyz);
  float nDotL = max(dot(normal, lightDirection), 0.0);
  v_Color = vec4(color.rgb * nDotL + vec3(0.1), color.a);
}
`;

const FRAGSHADER_SOURCE: string = `
precision mediump float;
uniform vec4 v_Color;
void main(){
  gl_FragColor = v_Color;
}
`;

const g_modelMatrix = new Matrix4(),
  g_MvpMatrix = new Matrix4();
const ANGLE_STEP = 3.0;
const g_arm1Angle = -90;
const g_jointAngle = 0;
const g_normalMatrix = new Matrix4();

function main() {
  const canvas: HTMLCanvasElement = document.querySelector('canvas#jointmode');
  const gl: WebGLRenderingContextWithProgram = getWebGLContext(canvas);
  if (!gl) {
    err('fail to init webgl');
    return;
  }
  if (!initShaders(gl, VERTEXSHADER_SOUCE, FRAGSHADER_SOURCE)) {
    err('fail to init shader');
    return;
  }
  // 设置点的数据
  const n = initVertexBuffer(gl);
  if (n < 0) {
    err('fail to init vertex');
    return;
  }

  gl.clearColor(...black);
  gl.enable(gl.DEPTH_TEST);

  const u_MvpMatrix: WebGLUniformLocation = gl.getUniformLocation(
    gl.program,
    'u_MvpMatrix'
  );
  const u_NoramlMatrix: WebGLUniformLocation = gl.getUniformLocation(
    gl.program,
    'u_NoramlMatrix'
  );
  if (!u_MvpMatrix || !u_NoramlMatrix) {
    err('fail to get location');
    return;
  }

  const viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(50, canvas.width / canvas.height, 1.0, 100);
  viewProjMatrix.lookAt(20, 10, 30, 0, 0, 0, 0, 1, 0);

  draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NoramlMatrix);
}

function initVertexBuffer(gl: WebGLRenderingContextWithProgram) {
  // Vertex coordinates（a cuboid 3.0 in width, 10.0 in height, and 3.0 in length with its origin at the center of its bottom)
  let vertices = new Float32Array([
    1.5,
    10.0,
    1.5,
    -1.5,
    10.0,
    1.5,
    -1.5,
    0.0,
    1.5,
    1.5,
    0.0,
    1.5, // v0-v1-v2-v3 front
    1.5,
    10.0,
    1.5,
    1.5,
    0.0,
    1.5,
    1.5,
    0.0,
    -1.5,
    1.5,
    10.0,
    -1.5, // v0-v3-v4-v5 right
    1.5,
    10.0,
    1.5,
    1.5,
    10.0,
    -1.5,
    -1.5,
    10.0,
    -1.5,
    -1.5,
    10.0,
    1.5, // v0-v5-v6-v1 up
    -1.5,
    10.0,
    1.5,
    -1.5,
    10.0,
    -1.5,
    -1.5,
    0.0,
    -1.5,
    -1.5,
    0.0,
    1.5, // v1-v6-v7-v2 left
    -1.5,
    0.0,
    -1.5,
    1.5,
    0.0,
    -1.5,
    1.5,
    0.0,
    1.5,
    -1.5,
    0.0,
    1.5, // v7-v4-v3-v2 down
    1.5,
    0.0,
    -1.5,
    -1.5,
    0.0,
    -1.5,
    -1.5,
    10.0,
    -1.5,
    1.5,
    10.0,
    -1.5, // v4-v7-v6-v5 back
  ]);

  // Normal
  let normals = new Float32Array([
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0, // v0-v1-v2-v3 front
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0, // v0-v3-v4-v5 right
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0, // v0-v5-v6-v1 up
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0, // v1-v6-v7-v2 left
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0, // v7-v4-v3-v2 down
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0, // v4-v7-v6-v5 back
  ]);

  // Indices of the vertices
  let indices = new Uint8Array([
    0,
    1,
    2,
    0,
    2,
    3, // front
    4,
    5,
    6,
    4,
    6,
    7, // right
    8,
    9,
    10,
    8,
    10,
    11, // up
    12,
    13,
    14,
    12,
    14,
    15, // left
    16,
    17,
    18,
    16,
    18,
    19, // down
    20,
    21,
    22,
    20,
    22,
    23, // back
  ]);

  if (!initArrayBuffers(gl, 'a_Position', vertices, gl.FLOAT, 3)) return -1;
  if (!initArrayBuffers(gl, 'a_Normal', normals, gl.FLOAT, 3)) return -1;

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  const indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('fail to init indexBuffer');
    return -1; 
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function draw(
  gl: WebGLRenderingContextWithProgram,
  n,
  viewProjMatrix: Matrix4,
  u_MvpMatrix: WebGLUniformLocation,
  u_NoramlMatrix: WebGLUniformLocation
) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const arm1Length = 10;
  g_modelMatrix.setTranslate(0, -12, 0);
  g_modelMatrix.rotate(g_arm1Angle, 0, 1, 0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NoramlMatrix);

  g_modelMatrix.translate(0, arm1Length, 0);
  g_modelMatrix.rotate(g_jointAngle, 0, 0, 1);
  g_modelMatrix.scale(1.3, 1.0, 1.3);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NoramlMatrix);
}

function drawBox(
  gl: WebGLRenderingContextWithProgram,
  n,
  viewProjMatrix: Matrix4,
  u_MvpMatrix: WebGLUniformLocation,
  u_NoramlMatrix: WebGLUniformLocation
) {
  g_MvpMatrix.set(viewProjMatrix);
  g_MvpMatrix.multiply(g_modelMatrix);
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);

  g_normalMatrix.setInverseOf(g_modelMatrix);
  g_normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NoramlMatrix, false, g_normalMatrix.elements);

  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

main();
