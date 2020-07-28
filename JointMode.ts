import VERTEXSHADER_SOUCE from './JointMode.vert';
import FRAGSHADER_SOURCE from './JointMode.frag';

import {
  getWebGLContext,
  initShaders,
  WebGL2RenderingContextWithProgram,
} from './cuon-utils';
import { err } from './common';

function main() {
  const canvas: HTMLCanvasElement = document.querySelector('canvas#jointmode');
  const gl: WebGL2RenderingContextWithProgram = getWebGLContext(canvas);
  if (!gl) {
    err('fail to init webgl');
    return;
  }
  if (!initShaders(gl, VERTEXSHADER_SOUCE, FRAGSHADER_SOURCE)) {
    err('fail to init shader');
    return;
  }
}

main();
