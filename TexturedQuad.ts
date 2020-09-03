import { WebGLRenderingContextWithProgram } from './cuon-utils';
import { getWebGLContext } from './cuon-utils';
import { initShaders } from './cuon-utils';
import skyImg from './resources/sky.jpg';
import circleImg from './resources/circle.gif';
import { black } from './common';

const VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute vec2 a_TexCoord;
varying vec2 v_TexCoord;
void main(){
  gl_Position = a_Position;
  v_TexCoord = a_TexCoord;
}
`;

const FSHADER_SOURCE = `
precision mediump float;
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
varying vec2 v_TexCoord;
void main(){
  vec4 color0 = texture2D(u_Sampler0, v_TexCoord);
  vec4 color1 = texture2D(u_Sampler1, v_TexCoord);
  gl_FragColor = color0 * color1;
}
`;

function main(): void {
  const canvas: HTMLCanvasElement = document.getElementById(
    'point'
  ) as HTMLCanvasElement;
  const gl: WebGLRenderingContextWithProgram = getWebGLContext(canvas);
  if (!gl) {
    console.error('fail to render context for webgl');
    return;
  }
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.error('fail to init shader');
    return;
  }
  const n: number = initVertexBuffers(gl);
  if (n < 0) {
    console.error('fail to init vertex buffer');
    return;
  }
  gl.clearColor(...black);

  if (!initTextures(gl, n)) {
    console.error('fail to init texture');
    return;
  }
}

function initVertexBuffers(gl: WebGLRenderingContextWithProgram): number {
  const verticesTexCoords = new Float32Array([
    -0.5,
    0.5,
    0.0,
    1.0,
    -0.5,
    -0.5,
    0.0,
    0.0,
    0.5,
    0.5,
    1.0,
    1.0,
    0.5,
    -0.5,
    1.0,
    0.0,
  ]);
  const n = 4;
  const vertexTexCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

  const FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;

  const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
  gl.enableVertexAttribArray(a_Position);

  const a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
  gl.enableVertexAttribArray(a_TexCoord);

  return n;
}

function initTextures(gl: WebGLRenderingContextWithProgram, n: number) {
  const texture0 = gl.createTexture();
  const texture1 = gl.createTexture();

  const u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  const u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');

  const image0 = new Image();
  image0.src = skyImg; // parcel 的打包只是将文件复制到dist文件夹,其余的图片行为, 比如加载完成, 和原生一样
  image0.onload = () => loadTexture(gl, n, texture0, u_Sampler0, image0, 0);

  const image1 = new Image();
  image1.src = circleImg;
  image1.onload = () => loadTexture(gl, n, texture1, u_Sampler1, image1, 1);

  return true;
}

let g_texUnit0 = false,
  g_texUnit1 = false;

function loadTexture(
  gl: WebGLRenderingContextWithProgram,
  n: number,
  texture: WebGLTexture,
  u_Sampler: WebGLUniformLocation,
  image: HTMLImageElement,
  texUnit
) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // 处理加载的图像

  if (texUnit === 0) {
    gl.activeTexture(gl.TEXTURE0);
    g_texUnit0 = true;
  } else {
    gl.activeTexture(gl.TEXTURE1);
    g_texUnit1 = true;
  }

  gl.bindTexture(gl.TEXTURE_2D, texture); // 绑定纹理对象
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler, texUnit);
  gl.clear(gl.COLOR_BUFFER_BIT);
  if (g_texUnit0 && g_texUnit1) {
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
  }
}

main();
