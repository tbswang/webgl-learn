import {
  WebGL2RenderingContextWithProgram,
  getWebGLContext,
  initShaders,
} from './cuon-utils';
import { black, getRandomArbitrary } from './common';

const VSHADER_SOURCE = `
attribute vec4 a_Position;
void main(){
  gl_Position = a_Position;
  gl_PointSize = 10.0;
}
`;
const FSHADER_SOURCE = `
precision mediump float;
uniform float u_Width;
uniform float u_Height;
void main(){
  gl_FragColor = vec4(gl_FragCoord.x/u_Width, 0.0, gl_FragCoord.y/u_Height, 1.0);
}
`;

function main() {
  const canvas: HTMLCanvasElement = document.getElementById(
    'point'
  ) as HTMLCanvasElement;
  const gl: WebGL2RenderingContextWithProgram = getWebGLContext(canvas);
  if (!gl) {
    console.error('fail to init shader');
    return;
  }
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.error('fail to init shader');
    return;
  }
  const n = initVertexBuffers(gl);
  if (n < 0) {
    console.error('fail to set position of vertices');
    return;
  }
  gl.clearColor(...black);

  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl: WebGL2RenderingContextWithProgram) {
  const n = 3;
  // const verticesSizes: Float32Array = createPoint(n);
  const verticesSizes = new Float32Array([
    0.0, 0.5, 1.0, .0, .0,
    -0.5, -0.5, .0, 1.0, .0,
    0.5, -0.5, .0, .0, 1.0
  ]);
  const vertexSizeBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesSizes, gl.STATIC_DRAW);
  const FSIZE = verticesSizes.BYTES_PER_ELEMENT;
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  // 要赋值的变量, 取几个数, 数据格式, 是否归一化, 每个定点的大小, 最开始的偏移量
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
  gl.enableVertexAttribArray(a_Position);

  const u_Width = gl.getUniformLocation(gl.program, 'u_Width');
  const u_Height = gl.getUniformLocation(gl.program, 'u_Height');
  gl.uniform1f(u_Width, gl.drawingBufferWidth);
  gl.uniform1f(u_Height, gl.drawingBufferHeight);

  // gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer);
  // gl.bufferData(gl.ARRAY_BUFFER, verticesSizes, gl.STATIC_DRAW);
  // const a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  // gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
  // gl.enableVertexAttribArray(a_Color);

  return n;
}

main();

/**
 * 随机生成n个点 [x1, y1, size1, x2, y2, size2....]
 * @param n 点的个数
 */
function createPoint(n: number): Float32Array {
  let i = 1;
  const pointArray = [];
  while (i <= n) {
    pointArray.push(
      getRandomArbitrary(-1.0, 1.0), // x
      getRandomArbitrary(-1.0, 1.0), // y
      getRandomArbitrary(1, 30)
    );
    i++;
  }
  // console.log('pointArray', pointArray);
  return new Float32Array(pointArray);
}
