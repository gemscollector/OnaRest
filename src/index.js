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
let hasScrollY = false;

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
  baseSize: 40,
  color1: '#bdba2a',
  color2: '#20d419',
  color3: '#b342f5',
  color4: '#4cdbff',
  color5: '#3f51b5',
  color6: '#2196f3',
  color7: '#03a9f4',
  color8: '#00bcd4'
});

const girl = new modeltree({
  name: 'ona',
  file: './models/tree.glb',
  scene: scene,
  scale: 2,
  baseSize: 20,
  color1: '#AAAAAA',
  color2: '#371C1C',
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

let targetStrength = 0;
let currentStrength = 0;
let lastMouseTime = Date.now();

// ==========================
// Cursor → World Projection
// ==========================
const mouse = new THREE.Vector2();
const mouseWorld = new THREE.Vector3();
const currentMouse = new THREE.Vector3();
const raycaster = new THREE.Raycaster();

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  raycaster.ray.intersectPlane(planeZ, mouseWorld);

  lastMouseTime = Date.now();
  targetStrength = 1.0;
});

/*------------------------------
Animation Loop
------------------------------*/
function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();
  currentMouse.lerp(mouseWorld, 0.05);
  if (leaf && leaf.particlesMaterial && leaf.particlesMaterial.uniforms.uMouse) {
    leaf.particlesMaterial.uniforms.uMouse.value.copy(currentMouse);
  }
  if (girl && girl.particlesMaterial && girl.particlesMaterial.uniforms.uMouse) {
    girl.particlesMaterial.uniforms.uMouse.value.copy(currentMouse);
  }

  if (leaf && leaf.particlesMaterial && leaf.particlesMaterial.uniforms.uTime) {
    leaf.particlesMaterial.uniforms.uTime.value = elapsedTime;
  }
  if (girl && girl.particlesMaterial && girl.particlesMaterial.uniforms.uTime) {
    girl.particlesMaterial.uniforms.uTime.value = elapsedTime;
  }

  if (leaf && leaf.particlesMaterial && leaf.particlesMaterial.uniforms.uHighlightTime) {
    leaf.particlesMaterial.uniforms.uHighlightTime.value = elapsedTime * 2;
  }
  if (girl && girl.particlesMaterial && girl.particlesMaterial.uniforms.uHighlightTime) {
    girl.particlesMaterial.uniforms.uHighlightTime.value = elapsedTime;
  }

  if (leaf && leaf.particlesMaterial && leaf.particlesMaterial.uniforms.uStrength) {
    if (Date.now() - lastMouseTime > 200) {
      targetStrength = 0.0;
    }
    currentStrength += (targetStrength - currentStrength) * 0.05;
    leaf.particlesMaterial.uniforms.uStrength.value = currentStrength;
  }
  if (girl && girl.particlesMaterial && girl.particlesMaterial.uniforms.uStrength) {
    girl.particlesMaterial.uniforms.uStrength.value = currentStrength;
  }

  if (hasScrollY) {
    scene.rotation.y += (targetRotation - scene.rotation.y) * 0.05;
  }

  composer.render();
}
animate();

/* Cursor */

/*------------------------------
Scroll Rotation
------------------------------*/
function updateRotationFromViewport(event) {
  const scrollY = event?.data?.scrollY;
  if (typeof scrollY !== 'number') return;

  console.log('[IFRAME] scrollY получен от родителя:', scrollY);

  if (scrollY < 50) return;

  const screenCenter = window.innerHeight / 2;
  const offset = scrollY - screenCenter;
  targetRotation = offset * 0.002;
  hasScrollY = true;

  const rect = renderer.domElement.getBoundingClientRect();
  const progress = Math.min(Math.max((screenCenter - rect.top) / window.innerHeight, 0), 1);

  if (leaf?.particlesMaterial?.uniforms?.uScrollProgress) {
    leaf.particlesMaterial.uniforms.uScrollProgress.value = progress;
  }
  if (girl?.particlesMaterial?.uniforms?.uScrollProgress) {
    girl.particlesMaterial.uniforms.uScrollProgress.value = progress;
  }

  if (girl?.particles) {
    girl.particles.position.y = progress * 1.5;
  }
}
window.addEventListener('message', updateRotationFromViewport);

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
