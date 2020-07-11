import { getWebGLContext, initShaders } from './cuon-utils';
// 定点着色器
const VSHADER_SOURCE: string = `
void main(){
  gl_Position = vec4(0., 0.5, 0.0, 1.0);
  gl_PointSize = 10.0;
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

  const gl = getWebGLContext(canvas);
  if (!gl) {
    console.error('falied to init webgl');
    return;
  }

  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
    console.log('failed to  shader');
    return;
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.POINTS, 0, 1);
}

main();
