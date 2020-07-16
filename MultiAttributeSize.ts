import {
  WebGL2RenderingContextWithProgram,
  getWebGLContext,
  initShaders,
} from './cuon-utils';
import { black, getRandomArbitrary } from './common';

const VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute float a_PointSize;
void main(){
  gl_Position = a_Position;
  gl_PointSize = a_PointSize;
}
`;
const FSHADER_SOURCE = `
precision mediump float;
uniform vec4 u_FragColor;
void main(){
  gl_FragColor = u_FragColor;
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

  gl.drawArrays(gl.POINTS, 0, n);
}

function initVertexBuffers(gl: WebGL2RenderingContextWithProgram) {
  const n = 10;
  const verticesSizes: Float32Array = createPoint(n);
  // const verticesSizes = new Float32Array([
  //   0.0,
  //   0.5,
  //   10.0,
  //   -0.5,
  //   -0.5,
  //   20.0,
  //   0.5,
  //   -0.5,
  //   30.0,
  // ]);
  const vertexSizeBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesSizes, gl.STATIC_DRAW);
  const FSIZE = verticesSizes.BYTES_PER_ELEMENT;
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 3, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesSizes, gl.STATIC_DRAW);
  const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
  gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 3, FSIZE * 2);
  gl.enableVertexAttribArray(a_PointSize);

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
      getRandomArbitrary(-1.0, 1.0),
      getRandomArbitrary(-1.0, 1.0),
      getRandomArbitrary(1, 30)
    );
    i++;
  }
  // console.log('pointArray', pointArray);
  return new Float32Array(pointArray);
}
