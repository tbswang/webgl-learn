function main(){
  const canvas = document.querySelector('#glCanvas');
  const gl = canvas.getContext('webgl');
  if(!gl){
    alert('webgl is not supported');
    return;
  }
  gl.clearColor(0,0,0,0.5);
  gl.clear(gl.COLOR_BUFFER_BIT)
}

main();