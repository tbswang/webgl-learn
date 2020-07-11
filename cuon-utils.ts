// const WebGLUtils = require('./webgl-utils.js').default;
// const WebGLDebugUtils = require('./webgl-debug.js').default;
import WebGLUtils from './webgl-utils.js';
import  WebGLDebugUtils from './webgl-debug.js';

export interface WebGL2RenderingContextWithProgram extends WebGL2RenderingContext{
  program?: WebGLProgram
}

/**
 * 给gl挂载一个对象
 * @param gl
 * @param vshader
 * @param fshader
 */
export function initShaders(
  gl: WebGL2RenderingContextWithProgram,
  vshader: string,
  fshader: string
): Boolean {
  const program = createProgram(gl, vshader, fshader);
  if (!program) {
    console.log('Fail to create program');
    return false;
  }
  gl.useProgram(program);
  gl.program = program;

  return true;
}

/**
 * 创建一个project对象
 * @param gl
 * @param vshader
 * @param fshader
 */
export function createProgram(
  gl: WebGL2RenderingContext,
  vshader: string,
  fshader: string
): WebGLProgram {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
  if (!vertexShader || !fragmentShader) {
    return null;
  }

  // create a program object
  const program = gl.createProgram();
  if (!program) {
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);

  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    const err = gl.getProgramInfoLog(program);
    console.error('Failed to link program', err);
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }
  return program;
}

export function loadShader(
  gl: WebGL2RenderingContext,
  type: GLenum,
  source: string
): WebGLShader {
  // create shader object
  const shader: WebGLShader = gl.createShader(type);
  if (shader === null) {
    console.log('unable to create shader');
    return null;
  }

  // set shader program
  gl.shaderSource(shader, source);

  // compile shader
  gl.compileShader(shader);

  // check the result of compilation
  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    const error = gl.getShaderInfoLog(shader);
    console.log('fail to compile shader' + error);
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function getWebGLContext(
  canvas: HTMLCanvasElement,
  optp_debug?: Boolean
): WebGL2RenderingContextWithProgram {
  let gl: WebGL2RenderingContextWithProgram = WebGLUtils.setupWebGL(canvas);
  if (!gl) return null;

  if (arguments.length < 2 || optp_debug) {
    gl = WebGLDebugUtils.makeDebugContext(gl);
  }
  return gl;
}
