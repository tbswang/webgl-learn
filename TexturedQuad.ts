import { WebGL2RenderingContextWithProgram } from "./cuon-utils";
import { getWebGLContext } from "./cuon-utils";
import { initShaders } from "./cuon-utils";

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
uniform sample2D u_Sampler;
varying vec2 v_TexCoord;
void main(){
  gl_FragColor = texture2D(u_Sampler, v_TexCoord);
}
`;

function main():void {
  const canvas: HTMLCanvasElement = document.getElementById('point') as HTMLCanvasElement;
  const gl: WebGL2RenderingContextWithProgram = getWebGLContext(canvas);
  initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);


}

function initVertexBuffers(gl: WebGL2RenderingContextWithProgram) {
  const verticesTexCoords = new Float32Array([
    -0.5,  0.5,   0.0, 1.0,
    -0.5, -0.5,   0.0, 0.0,
     0.5,  0.5,   1.0, 1.0,
     0.5, -0.5,   1.0, 0.0,
  ]);
  const n = 4;
  const vertexTexCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);
  const FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE*4, 0);
  gl.enableVertexAttribArray(a_Position);

  const a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE*4, FSIZE*2)
  gl.enableVertexAttribArray(a_TexCoord);

  return n;
}