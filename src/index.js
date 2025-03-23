import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Model from './model';
import gsap from 'gsap';
import modeltree from './modeltree';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

/*------------------------------
Renderer
------------------------------*/
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/*------------------------------
Scene & Camera
------------------------------*/
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 5;
camera.position.y = 1;
let targetRotation = 0;

/*------------------------------
Lights
------------------------------*/
const ambientLight = new THREE.AmbientLight(0xffe9d1, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffc97f, 1.0);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

const spotLight = new THREE.SpotLight(0xffddaa, 2);
spotLight.position.set(0, 5, 5);
scene.add(spotLight);

/*------------------------------
Models
------------------------------*/
const leaf = new Model({
  name: 'leaf',
  file: './models/leaf.glb',
  scene: scene,
  scale: 4,
  color1: 'yellow',
  color2: 'green'
});

const girl = new modeltree({
  name: 'ona',
  file: './models/tree.glb',
  scene: scene,
  scale: 2
});

/*------------------------------
Bloom Effect
------------------------------*/
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.2,  // intensity
  0.4,  // radius
  0.85  // threshold
);
composer.addPass(bloomPass);

/*------------------------------
Clock
------------------------------*/
const clock = new THREE.Clock();

/*------------------------------
Animation Loop
------------------------------*/
function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  // 🔥 Обновляем время в шейдере для частиц
  if (leaf && leaf.particlesMaterial && leaf.particlesMaterial.uniforms.uTime) {
    leaf.particlesMaterial.uniforms.uTime.value = elapsedTime;
  }

  // 🔁 Вращение сцены по скроллу
  scene.rotation.y += (targetRotation - scene.rotation.y) * 0.05;

  composer.render();
}
animate();

/*------------------------------
Scroll Rotation
------------------------------*/
function handleScroll() {
  const scrollY = window.scrollY;
  targetRotation = scrollY * 0.002;
}
window.addEventListener('scroll', handleScroll);

/*------------------------------
Resize
------------------------------*/
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);
