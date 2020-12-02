import {
  getWebGLContext,
  initShaders,
  WebGLRenderingContextWithProgram,
} from '../cuon-utils';
import { err, black } from '../common';
import { Matrix4, Vector3 } from '../cuon-matrix';

const VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal;
uniform mat4 u_MvpMatrix;
uniform vec3 u_LightColor;
uniform vec3 u_LightDirection;
uniform vec3 u_AmbientLight;
varying vec4 v_Color;
  void main(){
    gl_Position = u_MvpMatrix * a_Position;
    vec3 normal = normalize(a_Normal.xyz);
    float nDotL = max(dot(u_LightDirection, normal), 0.0);
    vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;
    vec3 ambient = u_AmbientLight * a_Color.rgb;
    v_Color = vec4(diffuse + ambient, a_Color.a);
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
  const gl: WebGLRenderingContextWithProgram = getWebGLContext(canvas);
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
  gl.enable(gl.DEPTH_TEST); // 开启深度检测

  // -------------------------------设置颜色相关 start --------------------------------------------
  const u_MvpMatrix: WebGLUniformLocation = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  const u_LightColor: WebGLUniformLocation = gl.getUniformLocation(gl.program, 'u_LightColor')
  const u_LightDirection:WebGLUniformLocation = gl.getUniformLocation(gl.program, 'u_LightDirection')
  const u_AmbientLight: WebGLUniformLocation = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  if (!u_MvpMatrix || !u_LightColor || !u_LightDirection  || !u_AmbientLight) { 
    err('fail to get location');
    return;
  }

  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0)

  const lightDirection: Vector3 = new Vector3([.5, 3,4])
  lightDirection.normalize();
  gl.uniform3fv(u_LightDirection, lightDirection.elements)

  gl.uniform3f(u_AmbientLight, .2, .2,.2);

  const modelMatrix: Matrix4 = new Matrix4();
  modelMatrix.setTranslate(0,1,0);  
  modelMatrix.rotate(20, 0, 0, 1)

  const mvpMatrix: Matrix4 = new Matrix4();
  mvpMatrix.setPerspective(30, canvas.width/canvas.height,1 , 100)
  mvpMatrix.lookAt(3,3,7, 0,0,0,0,1,0)

  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  // -------------------------------设置颜色相关 end --------------------------------------------

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)

}

function initVertexShader(gl: WebGLRenderingContextWithProgram): number {
  const vertices = new Float32Array([   // Coordinates
    1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
    1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
    1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
   -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
   -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
    1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
 ]);


 const colors = new Float32Array([    // Colors
   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
]);


 const normals = new Float32Array([    // Normal
   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
 ]);


 // Indices of the vertices
 const indices = new Uint8Array([
    0, 1, 2,   0, 2, 3,    // front
    4, 5, 6,   4, 6, 7,    // right
    8, 9,10,   8,10,11,    // up
   12,13,14,  12,14,15,    // left
   16,17,18,  16,18,19,    // down
   20,21,22,  20,22,23     // back
]);

  const indexBuffer:WebGLBuffer = gl.createBuffer();
  if(!indexBuffer){
    err('fail to init buffer')
    return;
  }

  if(!initArrayBuffer(gl, vertices, 3,gl.FLOAT, 'a_Position')){
    err('fail to init a_Position buffer')
    return;
  }
  if(!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color')){
    err('fail to init a_Color buffer')
    return;
  }

  if(!initArrayBuffer(gl, normals, 3, gl.FLOAT, 'a_Normal')) return -1;

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

  return indices.length;
}

function initArrayBuffer(gl: WebGLRenderingContextWithProgram, data: any, num: number, type: number,attribute: string){
  const buffer: WebGLBuffer = gl.createBuffer();
  if(!buffer){
    err('fail to create buffer');
    return false;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

  const a_attribute: GLint = gl.getAttribLocation(gl.program, attribute)
  if(a_attribute < 0){
    err(`fail to get ${attribute}`)
    return false;
  }

  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0)
  gl.enableVertexAttribArray(a_attribute)

  return true
}

main();
