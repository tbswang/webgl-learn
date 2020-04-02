// add 2d context 
// draw a plain

function getGlInstance(){
  const canvas = document.querySelector('#glCanvas');
  const gl = canvas.getContext('webgl');
  if(!gl){
    alert('webgl is not supported');
    return;
  }
  return gl;
}

const gl = getGlInstance();

const vsSource = `
  attribute vec4 aVertexPosition;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  void main(){
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  }
`;

const fsSource = `
  void main(){
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
`;

function loadShader(gl,type, source){
  const shader = gl.createShader(type);
  gl.shaderSource(shder, source);
  gl.compileShader(shader);

  if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
    alert("comiple err");
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function initShaderProgram(gl, vsSource, fsSource){
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if(!gl.getShaderParameter(shaderProgram, gl.LINK_STATUS)){
    alert('link err');
    return null;
  }
  return shaderProgram;
}

const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

function initBuffers(gl){
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [
    -1.0,  1.0,
     1.0,  1.0,
    -1.0, -1.0,
     1.0, -1.0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  return{
    position: positionBuffer
  }
}

