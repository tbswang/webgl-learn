import {
  getWebGLContext,
  initShaders,
  WebGLRenderingContextWithProgram,
} from '../cuon-utils';

export type vec4 = [number, number, number, number];
export type vec2 = [number, number];

// 定点着色器
// 用来描述点的特性, 比如位置, 大小.
const VSHADER_SOURCE: string = `
attribute vec4 a_Position;
attribute float a_PointSize;
void main(){
  gl_Position = a_Position; // 内置变量, 设置点的位置
  gl_PointSize = a_PointSize; //  内置变量, 设置点的大小
}
`;

// 片段着色器
const FSHADER_SOURCE: string = `
precision mediump float;
uniform vec4 u_FragColor;
void main(){
  gl_FragColor=u_FragColor; // 内置变量, 颜色
}
`;
const g_points: Array<vec2> = [];
const g_colors: Array<vec4> = [];
const red: vec4 = [255/255, 0.0, 0.0, 1.0];
const black: vec4 = [0.0, 0.0, 0.0, 1.0];
const green: vec4 = [0.0, 1.0, 0.0, 1.0] 
const white: vec4 = [1.0, 1.0, 1.0, 1.0];

function main() {
  // 获取canvas元素
  const canvas: HTMLCanvasElement = document.querySelector('canvas#point');

  // 初始化canvas
  const gl: WebGLRenderingContextWithProgram = canvas.getContext("webgl");
  if (!gl) {
    console.error('falied to init webgl');
    return;
  }

  // 编译shader
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('failed to  shader');
    return;
  }

  // 获取gl中的参数
  const a_Position: GLint = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.error('fail to get position of a_Position');
    return;
  }
  gl.vertexAttrib3f(a_Position, 0.5, 0.5, -1.0);
  gl.vertexAttrib3f(a_Position, 0.5, 0, -1.0);

  const a_PointSize: GLint = gl.getAttribLocation(gl.program, 'a_PointSize');
  gl.vertexAttrib1f(a_PointSize, 20);

  const u_FragColor: WebGLUniformLocation = gl.getUniformLocation(gl.program, 'u_FragColor');
  gl.uniform4f(u_FragColor, ...red);

  // 设置背景色
  gl.clearColor(...black);

  // 清空canvas
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 绘制一个点
  gl.drawArrays(gl.POINTS, 0, 2);
}

main();
