import {
  getWebGLContext,
  initShaders,
  WebGL2RenderingContextWithProgram,
} from './cuon-utils';
import { err, black } from './common';
import { Matrix4 } from './cuon-matrix';

const VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute vec4 a_Color;
uniform mat4 u_MvpMatrix;
varying vec4 v_Color;
  void main(){
    gl_Position = u_MvpMatrix * a_Position;
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
  const canvas: HTMLCanvasElement = document.querySelector('canvas#cube');
  const gl: WebGL2RenderingContextWithProgram = getWebGLContext(canvas);
  if (!gl) {
    err('fail to get webgl context');
    return;
  }
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    err('fail to init shader');
    return;
  }

  const n: number = initVertexShader(gl)
  if(n < 0){
    err("fail to init vertex shader");
    return;
  }

  gl.clearColor(...black);
  gl.enable(gl.DEPTH_TEST)

  const u_MvpMatrix: WebGLUniformLocation = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if(u_MvpMatrix < 0){
    err('fail to get location of mvpMatrix');
    return;
  }
  const mvpMatrix: Matrix4 = new Matrix4();
  mvpMatrix.setPerspective(30, 1, 1 , 100)
  mvpMatrix.lookAt(3,3,7, 0,0,0,0,1,0)

  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT)

  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)

}

function initVertexShader(gl: WebGL2RenderingContextWithProgram): number {
  const verticesColor:Float32Array = new Float32Array([
    // Vertex coordinates and color
    1.0,  1.0,  1.0,     1.0,  1.0,  1.0,  // v0 White
    -1.0,  1.0,  1.0,     1.0,  0.0,  1.0,  // v1 Magenta
    -1.0, -1.0,  1.0,     1.0,  0.0,  0.0,  // v2 Red
      1.0, -1.0,  1.0,     1.0,  1.0,  0.0,  // v3 Yellow
      1.0, -1.0, -1.0,     0.0,  1.0,  0.0,  // v4 Green
      1.0,  1.0, -1.0,     0.0,  1.0,  1.0,  // v5 Cyan
    -1.0,  1.0, -1.0,     0.0,  0.0,  1.0,  // v6 Blue
    -1.0, -1.0, -1.0,     0.0,  0.0,  0.0   // v7 Black    
  ])
    // Indices of the vertices
  const indices: Uint8Array = new Uint8Array([
    0, 1, 2,   0, 2, 3,    // front
    0, 3, 4,   0, 4, 5,    // right
    0, 5, 6,   0, 6, 1,    // up
    1, 6, 7,   1, 7, 2,    // left
    7, 4, 3,   7, 3, 2,    // down
    4, 7, 6,   4, 6, 5     // back
   ]);

  const vertexColorBuffer: WebGLBuffer = gl.createBuffer();
  const indexBuffer:WebGLBuffer = gl.createBuffer();
  if(!vertexColorBuffer || !indexBuffer){
    err('fail to init buffer')
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColor, gl.STATIC_DRAW)
  const FSIZE: number = verticesColor.BYTES_PER_ELEMENT
  const a_Position: GLint = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0){
    err('fail to get location of a_Position')
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position)

  const a_Color: GLint = gl.getAttribLocation(gl.program, 'a_Color')
  if(a_Color<0){
    err('fail to get location of a_Color');return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)
  gl.enableVertexAttribArray(a_Color)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

  return indices.length;
}

main();
