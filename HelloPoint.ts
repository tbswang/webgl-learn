import {
  getWebGLContext,
  initShaders,
  WebGL2RenderingContextWithProgram,
} from './cuon-utils';

export type vec4 = [number, number, number, number];

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
void main(){
  gl_FragColor=vec4(.0, 1., .0, 1.0);
}
`;

const g_points: number[] = [];

let mouseDown = false;

const click = (
  e: MouseEvent,
  gl: WebGL2RenderingContextWithProgram,
  canvas: HTMLCanvasElement,
  a_Position: number
) => {
  const { clientX, clientY } = e;
  const rect = (e.target as HTMLElement).getBoundingClientRect();
  // debugger;
  const x = (clientX - rect.x - canvas.width / 2) / (canvas.width / 2);
  const y = (canvas.height / 2 - (clientY - rect.y)) / (canvas.height / 2);
  g_points.push(x);
  g_points.push(y);

  // 注释掉这一行, 点击一下就变成了透明的, 因为默认的颜色分量 是0.0, 就是透明的.
  gl.clear(gl.COLOR_BUFFER_BIT);

  const len = g_points.length;
  for (let i = 0; i < len; i += 2) {
    gl.vertexAttrib3f(a_Position, g_points[i], g_points[i + 1], 0.0);

    gl.drawArrays(gl.POINTS, 0, 1);
  }
};
function main() {
  //
  const canvas: HTMLCanvasElement = document.getElementById('point');
  // const gl = canvas.getContext("webgl");

  const gl: WebGL2RenderingContextWithProgram = getWebGLContext(canvas);
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

  canvas.onmousedown = (e) => {
    mouseDown = true;
    click(e, gl, canvas, a_Position)
  };
  // canvas.onmouseup = () => {
  //   mouseDown = false;
  // };
  canvas.onmousemove = (e) => {
    if(!mouseDown) return;
    console.log('canvas.onmousemove -> onmousemove');
    click(e, gl, canvas, a_Position)
  };

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.POINTS, 0, 1);
}

main();

document.getElementsByTagName('body')[0].addEventListener('mouseup', () => {
  console.log('body mouseup');
  mouseDown = false;
});
