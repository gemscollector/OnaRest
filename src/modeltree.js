import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as dat from 'dat.gui';
/* import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
 */
class modeltree {
  constructor(obj) {
    this.name = obj.name;
    this.file = obj.file;
    this.scene = obj.scene;
    this.scale = obj.scale || 1;

    this.loader = new GLTFLoader();
 /*    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('./draco/');
    this.loader.setDRACOLoader(dracoLoader); */

    this.init();
  }

  init() {
    this.loader.load(this.file, (gltf) => {
        this.model = gltf.scene;
      
        // 🔧 Настройка материалов — убираем блеск и добавляем шершавость
        this.model.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.roughness = 1.0;      // максимальная шершавость
            child.material.metalness = 0.0;      // без блеска
            child.material.envMapIntensity = 0;  // отключить влияние окружения, если есть
            child.material.needsUpdate = true;
          }
        });
        
        // Добавляем мягкий приглушённый свет к дамочке
        const softLight = new THREE.DirectionalLight(0xffddcc, -3.0); // тёплый и слабый
        softLight.position.set(1, 1, 1);
        this.model.add(softLight);

        const softSpot = new THREE.SpotLight(0xccccff, 0.5);
softSpot.angle = Math.PI / 2;
softSpot.penumbra = 0.8;
softSpot.decay = 2;
softSpot.distance = 3;
softSpot.position.set(-1, -2, 2);
softSpot.target.position.set(0, 0.5, 0);

this.model.add(softSpot);
this.model.add(softSpot.target);

const gui = new dat.GUI();

const folder = gui.addFolder('Luna Soft Spot');

folder.add(softSpot.position, 'x', -10, 10).name('X Position');
folder.add(softSpot.position, 'y', -10, 10).name('Y Position');
folder.add(softSpot.position, 'z', -10, 10).name('Z Position');

folder.add(softSpot.target.position, 'x', -10, 10).name('Target X');
folder.add(softSpot.target.position, 'y', -10, 10).name('Target Y');
folder.add(softSpot.target.position, 'z', -10, 10).name('Target Z');

folder.add(softSpot, 'intensity', 0, 5).name('Intensity');
folder.add(softSpot, 'angle', 0, Math.PI / 2).name('Angle');
folder.add(softSpot, 'penumbra', 0, 1).name('Penumbra');

folder.open();



        const fillLight = new THREE.AmbientLight(0x404040, -3.0); // общий свет
        this.model.add(fillLight);

        
        
      
        this.model.scale.set(this.scale, this.scale, this.scale);
        this.model.position.set(0, 0, 0);
        this.scene.add(this.model);

        // === Разбиваем дамочку на партикулы ===
        let firstMesh = null;

        this.model.traverse((child) => {
          if (child.isMesh && !firstMesh) {
            firstMesh = child;
          }
        });

        if (firstMesh) {
          const geometry = firstMesh.geometry.clone();
          const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.01,
            sizeAttenuation: true
          });

          const points = new THREE.Points(geometry, material);

          // Применяем ту же трансформацию, но поправляем вращение
          points.position.copy(this.model.position);
          points.scale.copy(this.model.scale);
          points.rotation.copy(this.model.rotation);

          // Корректируем наклон по оси X (дамочка стоя)
          points.rotation.x += Math.PI / 2;

          this.scene.add(points);
          this.model.visible = false; // скрываем оригинальную модель
        }
      });
  }
}

export default modeltree;