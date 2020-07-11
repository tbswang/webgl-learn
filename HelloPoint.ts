import { getWebGLContext, initShaders, WebGL2RenderingContextWithProgram } from './cuon-utils';
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
function main() {
  //
  const canvas: HTMLCanvasElement = document.getElementById('point');
  // const gl = canvas.getContext("webgl");

  const gl: WebGL2RenderingContextWithProgram = getWebGLContext(canvas);
  if (!gl) {
    console.error('falied to init webgl');
    return;
  }

  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
    console.log('failed to  shader');
    return;
  }

  const a_Position = gl.getAttribLocation(gl.program, 'a_Position' )

  if(a_Position < 0) {
    console.error('fail to get position of a_Position');
    return;
  }

  gl.vertexAttrib3f(a_Position, .5, .5, .0 );

  const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
  gl.vertexAttrib1f(a_PointSize, 5.0);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.POINTS, 0, 1);
}

main();
