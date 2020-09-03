import {
  WebGLRenderingContextWithProgram,
  getWebGLContext,
  initShaders,
} from '../cuon-utils';
import { black, getRandomArbitrary } from '../common';

const VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute vec4 a_Color;
varying vec4 v_Color;
void main(){
  gl_Position = a_Position;
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

function main() {
  const canvas: HTMLCanvasElement = document.getElementById(
    'point'
  ) as HTMLCanvasElement;
  const gl: WebGLRenderingContextWithProgram = getWebGLContext(canvas);
  if (!gl) {
    console.error('fail to init shader');
    return;
  }
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.error('fail to init shader');
    return;
  }
  const n: number | boolean = initVertexBuffers(gl);
  if (n < 0 || n === false) {
    console.error('fail to set position of vertices');
    return;
  }
  gl.clearColor(...black);

  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}
function initVertexBuffers(gl: WebGLRenderingContextWithProgram) {
  let verticesColors = new Float32Array([
    // Vertex coordinates and color
     0.0,  0.5,  1.0,  0.0,  0.0, 
    -0.5, -0.5,  0.0,  1.0,  0.0, 
     0.5, -0.5,  0.0,  0.0,  1.0, 
  ]);
  let n = 3;

  // 创建一个buffer(缓冲区)对象
  let vertexColorBuffer = gl.createBuffer();  
  if (!vertexColorBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // 将buffer绑定到gl中
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  let FSIZE = verticesColors.BYTES_PER_ELEMENT; // 每个元素的位
  // 获取a_Position, 给其赋值
  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // attribute变量, 每个顶点的分量, 数据格式, 是否归一化, 相邻两个顶点的字节数, 起始位置
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
  // 将a_Position赋值
  gl.enableVertexAttribArray(a_Position); 

  let a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
  gl.enableVertexAttribArray(a_Color); 

  // 解绑
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return n;
}

main();

