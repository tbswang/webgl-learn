import { WebGL2RenderingContextWithProgram } from './cuon-utils';
import { getWebGLContext } from './cuon-utils';
import { initShaders } from './cuon-utils';
import skyImg from './resources/sky.jpg';
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
uniform sampler2D u_Sampler;
varying vec2 v_TexCoord;
void main(){
  gl_FragColor = texture2D(u_Sampler, v_TexCoord);
}
`;

function main(): void {
  const canvas: HTMLCanvasElement = document.getElementById(
    'point'
  ) as HTMLCanvasElement;
  const gl: WebGL2RenderingContextWithProgram = getWebGLContext(canvas);
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

function initVertexBuffers(gl: WebGL2RenderingContextWithProgram): number {
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

function initTextures(gl: WebGL2RenderingContextWithProgram, n: number) {
  const texture = gl.createTexture();
  if (!texture) {
    console.error('fail to create texture');
    return;
  }

  const u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (!u_Sampler) {
    console.error('fail to get the location of u_Sampler');
    return false;
  }
  const image = new Image();
  image.src = skyImg;// parcel 的打包只是将文件复制到dist文件夹,其余的图片行为, 比如加载完成, 和原生一样
  image.onload = () => loadTexture(gl, n, texture, u_Sampler, image);

  return true;
}

function loadTexture(
  gl: WebGL2RenderingContextWithProgram,
  n: number,
  texture: WebGLTexture,
  u_Sampler: WebGLUniformLocation,
  image: HTMLImageElement
) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // 处理加载的图像
  gl.activeTexture(gl.TEXTURE0); // 激活纹理单元
  gl.bindTexture(gl.TEXTURE_2D, texture); // 绑定纹理对象
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}

main();
