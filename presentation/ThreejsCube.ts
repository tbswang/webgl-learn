import * as THREE from 'three';

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xfdfdfd, 2);
light.position.set(2, 2, 1).normalize();
scene.add(light);

let ambientLight = new THREE.AmbientLight(0x000022);
scene.add(ambientLight);

let geometry = new THREE.CubeGeometry(1, 1, 1);
let material = new THREE.MeshPhongMaterial({
  // light
  specular: 0xd76531,
  // intermediate
  color: 0xef8834,
  // dark
  emissive: 0x8c2317,
  shininess: 50,
  wireframe: false,
});
let cube = new THREE.Mesh(geometry, material);
cube.rotation.x = 3 ;
cube.rotation.y = 2;
scene.add(cube);

camera.position.z = 5;

renderer.render(scene, camera);
