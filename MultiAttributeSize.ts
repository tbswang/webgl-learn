import {
  WebGL2RenderingContextWithProgram, getWebGLContext, initShaders,
} from './cuon-utils';
import { black } from './common';

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
  const canvas: HTMLCanvasElement = document.getElementById('point') as HTMLCanvasElement;
  const gl: WebGL2RenderingContextWithProgram = getWebGLContext(canvas);
  if(!gl){
    console.error('fail to init shader');
    return;
  }
  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
    console.error('fail to init shader');
    return;
  }
  const n = initVertexBuffers(gl)
  if(n < 0){
    console.error('fail to set position of vertices');
    return;
  }
  gl.clearColor(...black);

  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.POINTS, 0, n);
}

function initVertexBuffers(gl: WebGL2RenderingContextWithProgram) {
  const n = 3;
  
  const vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT,false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  
  const sizes = new Float32Array([10.0, 20.0, 30.0]);
  const sizeBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
  const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
  gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_PointSize);

  return n;
}

main();
