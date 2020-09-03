import {
  getWebGLContext,
  initShaders,
  WebGLRenderingContextWithProgram,
} from './cuon-utils';

export type vec4 = [number, number, number, number];
export type vec2 = [number, number];

// 定点着色器
const VSHADER_SOURCE: string = `
attribute vec4 a_Position;
attribute float a_PointSize;
void main(){
  gl_Position = a_Position;
  gl_PointSize = a_PointSize;
}
`;

// 片段着色器
const FSHADER_SOURCE: string = `
precision mediump float;
uniform vec4 u_FragColor;
void main(){
  gl_FragColor=u_FragColor;
}
`;

const g_points: Array<vec2> = [];
const g_colors: Array<vec4> = [];
const red: vec4 = [1.0, 0.0, 0.0, 1.0];
const green: vec4 = [0.0, 1.0, 0.0, 1.0] 
const white: vec4 = [1.0, 1.0, 1.0, 1.0];

let mouseDown = false;

const click = (
  e: MouseEvent,
  gl: WebGLRenderingContextWithProgram,
  canvas: HTMLCanvasElement,
  a_Position: number,
  u_FragColor?
  ) => {
  const { clientX, clientY } = e;
  const rect = (e.target as HTMLElement).getBoundingClientRect();
  // debugger;
  const x = (clientX - rect.x - canvas.width / 2) / (canvas.width / 2);
  const y = (canvas.height / 2 - (clientY - rect.y)) / (canvas.height / 2);
  g_points.push([x, y]);

  if(x >= 0.0 && y >= 0.0){
    // 第一象限
    g_colors.push(red);
  } else if ( x < 0.0 && y < 0.0){
    // 第三象限
    g_colors.push(green);
  } else {
    g_colors.push(white);
  }

  // 注释掉这一行, 点击一下就变成了透明的, 因为默认的颜色分量 是0.0, 就是透明的.
  gl.clear(gl.COLOR_BUFFER_BIT);

  const len = g_points.length;
  for (let i = 0; i < len; i += 1) {
    const xy = g_points[i];
    const rgba = g_colors[i];
    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.drawArrays(gl.POINTS, 0, 1);
  }
};
function main() {
  //
  const canvas: HTMLCanvasElement = (document.getElementById('point') as HTMLCanvasElement);
  // const gl = canvas.getContext("webgl");

  const gl: WebGLRenderingContextWithProgram = getWebGLContext(canvas);
  if (!gl) {
    console.error('falied to init webgl');
    return;
  }

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('failed to  shader');
    return;
  }

  const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.error('fail to get position of a_Position');
    return;
  }
  gl.vertexAttrib3f(a_Position, 0.5, 0.5, 0.0);

  const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
  gl.vertexAttrib1f(a_PointSize, 5.0);

  // 获取点的颜色
  const u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');


  canvas.onmousedown = (e) => {
    mouseDown = true;
    click(e, gl, canvas, a_Position, u_FragColor)
  };
  // canvas.onmouseup = () => {
  //   mouseDown = false;
  // };
  // canvas.onmousemove = (e) => {
  //   if(!mouseDown) return;
  //   click(e, gl, canvas, a_Position)
  // };

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.POINTS, 0, 1);
}

main();

document.getElementsByTagName('body')[0].addEventListener('mouseup', () => {
  mouseDown = false;
});
